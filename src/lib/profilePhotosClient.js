'use client';

// Profil rasmlari API'si uchun klient yordamchilari. Yuklash ikki bosqichli
// (chat media bilan bir xil naqsh): presign -> to'g'ridan-to'g'ri S3'ga PUT ->
// server tekshiruvi (POST). Barcha funksiyalar `{ photos }` yoki `{ error }` qaytaradi.

async function json(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error || "Xatolik yuz berdi. Qayta urinib ko'ring." };
  return data;
}

export async function fetchMyPhotos() {
  try {
    return await json(await fetch('/api/profile/photos'));
  } catch {
    return { error: "Tarmoq xatosi" };
  }
}

export async function fetchUserPhotos(userId) {
  try {
    return await json(await fetch(`/api/chat/users/${userId}/photos`));
  } catch {
    return { error: "Tarmoq xatosi" };
  }
}

// `onProgress(0..1)` — ikkala fayl yuklanishining umumiy ulushi (XHR, chunki fetch
// yuklash progressini bermaydi).
function putWithProgress(url, blob, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', 'image/jpeg');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(String(xhr.status))));
    xhr.onerror = () => reject(new Error('network'));
    xhr.send(blob);
  });
}

export async function uploadProfilePhoto({ full, small }, onProgress) {
  try {
    const pre = await json(await fetch('/api/profile/photos/presign', { method: 'POST' }));
    if (pre.error) return pre;

    const total = full.size + small.size;
    const loaded = { full: 0, small: 0 };
    const report = () => onProgress?.((loaded.full + loaded.small) / total);
    await Promise.all([
      putWithProgress(pre.full.uploadUrl, full, (p) => ((loaded.full = p * full.size), report())),
      putWithProgress(pre.small.uploadUrl, small, (p) => ((loaded.small = p * small.size), report())),
    ]);

    return await json(
      await fetch('/api/profile/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: pre.photoId }),
      })
    );
  } catch {
    return { error: "Rasm yuklanmadi. Internetni tekshirib, qayta urinib ko'ring." };
  }
}

export async function setMainPhoto(photoId) {
  try {
    return await json(await fetch(`/api/profile/photos/${photoId}`, { method: 'PATCH' }));
  } catch {
    return { error: 'Tarmoq xatosi' };
  }
}

export async function deletePhoto(photoId) {
  try {
    return await json(await fetch(`/api/profile/photos/${photoId}`, { method: 'DELETE' }));
  } catch {
    return { error: 'Tarmoq xatosi' };
  }
}
