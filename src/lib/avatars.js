import { Block, Conversation } from '@/lib/models';
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
