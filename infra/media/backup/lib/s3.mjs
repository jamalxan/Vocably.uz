// Minimal S3 client (SigV4, path-style) for the backup tools: list / get / head / put on one bucket.
// No dependencies on purpose — the tools run in a stock `node:22-alpine` container on the media server and
// from a laptop during a restore, with nothing to install.
import { createHash, createHmac } from 'node:crypto';

const sha256hex = (data) => createHash('sha256').update(data).digest('hex');
const hmac = (key, data) => createHmac('sha256', key).update(data).digest();
// RFC 3986 encoding, as SigV4 requires (encodeURIComponent leaves !'()* alone).
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const unxml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? unxml(m[1]) : null;
};

/** Headers (incl. Authorization) for one request. Exported for the cross-check against the AWS SDK signer. */
export function signRequest({ method, host, path, query = {}, headers = {}, payloadHash, accessKey, secretKey, region, now = new Date() }) {
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = amzDate.slice(0, 8);
  const all = { host, 'x-amz-content-sha256': payloadHash, 'x-amz-date': amzDate };
  for (const [k, v] of Object.entries(headers)) all[k.toLowerCase()] = String(v).trim();
  const names = Object.keys(all).sort();
  const queryString = Object.keys(query)
    .sort()
    .map((k) => `${enc(k)}=${enc(String(query[k]))}`)
    .join('&');
  const canonical = [method, path, queryString, names.map((n) => `${n}:${all[n]}\n`).join(''), names.join(';'), payloadHash].join('\n');
  const scope = `${date}/${region}/s3/aws4_request`;
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256hex(canonical)].join('\n');
  const key = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, date), region), 's3'), 'aws4_request');
  const signature = createHmac('sha256', key).update(toSign).digest('hex');
  return {
    queryString,
    headers: { ...all, authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${names.join(';')}, Signature=${signature}` },
  };
}

export function createS3({ endpoint, region = 'us-east-1', accessKey, secretKey, bucket, fetchImpl = fetch }) {
  if (!endpoint || !accessKey || !secretKey || !bucket) throw new Error('S3 endpoint, access key, secret key and bucket are all required');
  const base = new URL(endpoint);

  async function request(method, key, { query = {}, body = null, headers = {} } = {}) {
    const path = `/${bucket}${key ? `/${key.split('/').map(enc).join('/')}` : ''}`;
    const signed = signRequest({ method, host: base.host, path, query, headers, payloadHash: sha256hex(body || ''), accessKey, secretKey, region });
    const { host: _host, ...send } = signed.headers; // fetch sets Host itself
    const res = await fetchImpl(`${base.origin}${path}${signed.queryString ? `?${signed.queryString}` : ''}`, { method, headers: send, body });
    return res;
  }

  const fail = async (res, what) => {
    const text = await res.text().catch(() => '');
    const err = new Error(`S3 ${what}: ${res.status} ${tag(text, 'Code') || ''} ${tag(text, 'Message') || ''}`.trim());
    err.status = res.status;
    return err;
  };

  return {
    bucket,
    /** Every object of the bucket: [{ key, size, etag, lastModified }]. */
    async list(prefix = '') {
      const out = [];
      let token = null;
      do {
        const query = { 'list-type': '2', 'max-keys': '1000', ...(prefix ? { prefix } : {}), ...(token ? { 'continuation-token': token } : {}) };
        const res = await request('GET', '', { query });
        if (!res.ok) throw await fail(res, 'list');
        const xml = await res.text();
        for (const m of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
          out.push({ key: tag(m[1], 'Key'), size: Number(tag(m[1], 'Size')), etag: (tag(m[1], 'ETag') || '').replace(/"/g, ''), lastModified: tag(m[1], 'LastModified') });
        }
        token = tag(xml, 'IsTruncated') === 'true' ? tag(xml, 'NextContinuationToken') : null;
      } while (token);
      return out;
    },
    /** { body: Buffer, contentType } or null when the object does not exist. */
    async get(key) {
      const res = await request('GET', key);
      if (res.status === 404) return null;
      if (!res.ok) throw await fail(res, `get ${key}`);
      return { body: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get('content-type') || 'application/octet-stream' };
    },
    /** { size, etag } or null when the object does not exist. */
    async head(key) {
      const res = await request('HEAD', key);
      if (res.status === 404) return null;
      if (!res.ok) throw await fail(res, `head ${key}`);
      return { size: Number(res.headers.get('content-length')), etag: (res.headers.get('etag') || '').replace(/"/g, '') };
    },
    async put(key, body, contentType = 'application/octet-stream') {
      const res = await request('PUT', key, { body, headers: { 'content-type': contentType } });
      if (!res.ok) throw await fail(res, `put ${key}`);
    },
  };
}
