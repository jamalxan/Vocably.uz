// Minimal S3-compatible server for local E2E runs (no signature checks, objects in memory).
// Covers what the chat uses: presigned PUT (browser XHR with CORS), GET with Range, HEAD,
// CopyObject (PUT + x-amz-copy-source), DeleteObjects (POST ?delete). Path-style URLs:
//   http://127.0.0.1:9100/<bucket>/<key>
// Start:  node e2e/s3-mock.mjs   (port 9100)
// Then build/start Next with S3_ENDPOINT=http://127.0.0.1:9100 S3_BUCKET=e2e S3_ACCESS_KEY=x S3_SECRET_KEY=y
import http from 'node:http';

const PORT = Number(process.env.S3_MOCK_PORT || 9100);
const objects = new Map(); // "bucket/key" → { body: Buffer, type: string }

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, HEAD, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', 'ETag, Content-Length, Content-Range, Accept-Ranges');
};
const readBody = (req) =>
  new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });

const server = http.createServer(async (req, res) => {
  cors(res);
  const url = new URL(req.url, `http://${req.headers.host}`);
  const id = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }
  if (req.method === 'PUT') {
    const src = req.headers['x-amz-copy-source'];
    if (src) {
      const from = objects.get(decodeURIComponent(String(src).replace(/^\/+/, '')));
      if (!from) {
        res.writeHead(404);
        return res.end();
      }
      objects.set(id, { ...from });
      res.writeHead(200, { 'Content-Type': 'application/xml' });
      return res.end('<CopyObjectResult><ETag>"copy"</ETag></CopyObjectResult>');
    }
    const body = await readBody(req);
    objects.set(id, { body, type: req.headers['content-type'] || 'application/octet-stream' });
    res.writeHead(200, { ETag: '"ok"' });
    return res.end();
  }
  if (req.method === 'POST' && url.searchParams.has('delete')) {
    await readBody(req);
    res.writeHead(200, { 'Content-Type': 'application/xml' });
    return res.end('<DeleteResult/>');
  }
  const obj = objects.get(id);
  if (!obj) {
    res.writeHead(404);
    return res.end();
  }
  if (req.method === 'HEAD') {
    res.writeHead(200, { 'Content-Length': obj.body.length, 'Content-Type': obj.type, 'Accept-Ranges': 'bytes' });
    return res.end();
  }
  if (req.method === 'GET') {
    const disposition = url.searchParams.get('response-content-disposition');
    const range = req.headers.range && /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
    const headers = { 'Content-Type': obj.type, 'Accept-Ranges': 'bytes', ...(disposition ? { 'Content-Disposition': disposition } : {}) };
    if (range) {
      const start = Number(range[1]);
      const end = range[2] ? Math.min(Number(range[2]), obj.body.length - 1) : obj.body.length - 1;
      const slice = obj.body.subarray(start, end + 1);
      res.writeHead(206, { ...headers, 'Content-Length': slice.length, 'Content-Range': `bytes ${start}-${end}/${obj.body.length}` });
      return res.end(slice);
    }
    res.writeHead(200, { ...headers, 'Content-Length': obj.body.length });
    return res.end(obj.body);
  }
  res.writeHead(405);
  res.end();
});

server.listen(PORT, '127.0.0.1', () => console.log(`S3 MOCK READY http://127.0.0.1:${PORT}`));
