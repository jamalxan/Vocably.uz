'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Avatar from './Avatar';
import AvatarCropper from './AvatarCropper';
import PhotoViewer from './PhotoViewer';
import { AVATAR_ACCEPT, AVATAR_INPUT_MAX_BYTES } from './avatarConfig';
import { deletePhoto, fetchMyPhotos, setMainPhoto, uploadProfilePhoto } from '@/lib/profilePhotosClient';

// Profil sahifasidagi o'z avatarim — Telegram "Sozlamalar"idagi kabi: avatarga
// bosilsa barcha rasmlar ko'ruvchida ochiladi (rasm bo'lmasa — fayl tanlash),
// kamera belgisi — yangi rasm qo'yish (fayl -> kesish -> yuklash).
export default function MyProfilePhoto({ size = 72 }) {
  const { chatUserId, displayName, username, setMyPhotoId } = useApp();
  const inputRef = useRef(null);
  const [photos, setPhotos] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [pickError, setPickError] = useState('');

  const syncPhotos = useCallback(
    (list) => {
      setPhotos(list);
      setMyPhotoId(list[0]?.id || null);
    },
    [setMyPhotoId]
  );

  useEffect(() => {
    let cancelled = false;
    fetchMyPhotos().then((res) => {
      if (!cancelled && !res.error) syncPhotos(res.photos || []);
    });
    return () => {
      cancelled = true;
    };
  }, [syncPhotos]);

  const pickFile = () => {
    setPickError('');
    inputRef.current?.click();
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    e.target.value = ''; // bir xil faylni qayta tanlash ham ishlasin
    if (!f) return;
    if (!f.type.startsWith('image/') || f.type === 'image/svg+xml') {
      setPickError('Faqat rasm fayli tanlang (JPG, PNG, WEBP).');
      return;
    }
    if (f.size > AVATAR_INPUT_MAX_BYTES) {
      setPickError('Rasm juda katta (25 MB dan oshmasin).');
      return;
    }
    setUploadError('');
    setProgress(0);
    setViewerOpen(false);
    setFile(f);
  };

  const onConfirm = async (blobs) => {
    setUploading(true);
    setUploadError('');
    const res = await uploadProfilePhoto(blobs, setProgress);
    setUploading(false);
    if (res.error) {
      setUploadError(res.error);
      return;
    }
    syncPhotos(res.photos || []);
    setFile(null);
  };

  const onSetMain = async (id) => {
    const res = await setMainPhoto(id);
    if (!res.error) syncPhotos(res.photos || []);
    return res;
  };

  const onDelete = async (id) => {
    const res = await deletePhoto(id);
    if (!res.error) syncPhotos(res.photos || []);
    return res;
  };

  const hasPhotos = photos?.length > 0;

  return (
    <>
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <button
          type="button"
          onClick={() => (hasPhotos ? setViewerOpen(true) : pickFile())}
          aria-label={hasPhotos ? "Profil rasmlarini ko'rish" : "Profil rasmini qo'yish"}
          className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <Avatar
            userId={chatUserId}
            photoId={photos?.[0]?.id}
            name={displayName}
            username={username}
            size={size}
            className={hasPhotos ? 'cursor-zoom-in' : 'cursor-pointer'}
          />
        </button>
        <button
          type="button"
          onClick={pickFile}
          aria-label="Yangi profil rasmi qo'yish"
          title="Yangi rasm qo'yish"
          className="absolute -bottom-0.5 -right-0.5 w-8 h-8 rounded-full bg-accent text-on-accent border-[3px] border-surface inline-flex items-center justify-center shadow-md hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Camera size={14} />
        </button>
        <input ref={inputRef} type="file" accept={AVATAR_ACCEPT} onChange={onFileChange} className="hidden" />
      </div>

      {pickError && (
        <p role="alert" className="sr-only">
          {pickError}
        </p>
      )}
      {pickError && <PickErrorToast text={pickError} onDone={() => setPickError('')} />}

      {file && (
        <AvatarCropper
          file={file}
          busy={uploading}
          progress={progress}
          error={uploadError}
          onCancel={() => !uploading && setFile(null)}
          onConfirm={onConfirm}
        />
      )}

      {viewerOpen && hasPhotos && chatUserId && (
        <PhotoViewer
          userId={chatUserId}
          photos={photos}
          title={displayName}
          isOwn
          onClose={() => setViewerOpen(false)}
          onSetMain={onSetMain}
          onDelete={onDelete}
          onAddNew={pickFile}
        />
      )}
    </>
  );
}

function PickErrorToast({ text, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-xl bg-danger text-white text-sm shadow-card">
      {text}
    </div>
  );
}
