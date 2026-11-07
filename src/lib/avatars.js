import { Block, Conversation, User } from '@/lib/models';
import { objectPresence } from '@/lib/s3';
import { canViewPhoto } from '@/lib/avatarShared';

// Server-only yordamchilar — profil rasmini boshqa foydalanuvchiga ko'rsatish
// mumkinmi, shuni hal qiladi (src/lib/avatarShared.js#canViewPhoto'ning DB qismi).

function pairKey(a, b) {
  return [String(a), String(b)].sort().join('_');
}

// Bitta (egasi, ko'ruvchi) juftligi uchun to'liq tekshiruv: blok va suhbat
// mavjudligi DB'dan olinadi. `owner` — kamida `_id photoVisibility` bilan.
export async function canViewerSeePhotos(owner, viewerId) {
  const isOwner = String(owner._id) === String(viewerId);
  if (isOwner) return true;
  if (owner.photoVisibility === 'nobody') return false;
  const [blocked, convo] = await Promise.all([
    Block.exists({
      $or: [
        { blockerId: owner._id, blockedId: viewerId },
        { blockerId: viewerId, blockedId: owner._id },
      ],
    }),
    owner.photoVisibility === 'friends'
      ? Conversation.exists({ pairKey: pairKey(owner._id, viewerId) })
      : Promise.resolve(null),
  ]);
  return canViewPhoto(owner.photoVisibility, { isOwner, hasConversation: !!convo, blocked: !!blocked });
}

// Ro'yxat/sarlavhalar uchun — joriy (asosiy) rasmning id'si yoki null. Chaqiruvchi
// kontekstni o'zi biladi (masalan conversations route'ida suhbat har doim bor),
// shuning uchun bu yerda qo'shimcha DB so'rovi yo'q.
export function currentPhotoId(user, { isOwner = false, hasConversation = false, blocked = false } = {}) {
  const top = user?.photos?.[0];
  if (!top) return null;
  if (!canViewPhoto(user.photoVisibility, { isOwner, hasConversation, blocked })) return null;
  return String(top._id);
}

// Bazada yozilgan, lekin S3'da fayli yo'q rasmlarni ro'yxatdan olib tashlaydi va
// qolganlarini qaytaradi. Sabab: 2026-11-06 media server (VPS) o'lganda undagi barcha
// avatar fayllari yo'qoldi, `User.photos` esa ularga ishora qilib qolgan edi — natijada
// asosiy rasm o'rnida bo'sh joy, galereyada buzuq slaydlar chiqardi. Faqat S3 aniq
// 404 bergan rasm o'chiriladi (`objectPresence === false`); tarmoq xatosida hech narsa
// o'zgarmaydi. `photos` — lean hujjatdagi massiv (tartib saqlanadi).
export async function pruneMissingPhotos(userId, photos) {
  if (!photos?.length) return photos || [];
  const checks = await Promise.all(photos.map((p) => objectPresence(p.smallKey)));
  const missing = photos.filter((_, i) => checks[i] === false);
  if (!missing.length) return photos;
  await User.updateOne({ _id: userId }, { $pull: { photos: { _id: { $in: missing.map((p) => p._id) } } } });
  const gone = new Set(missing.map((p) => String(p._id)));
  return photos.filter((p) => !gone.has(String(p._id)));
}
