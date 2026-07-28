import jwt from 'jsonwebtoken';

// So'rov headerlaridagi "Authorization: Bearer <token>" dan foydalanuvchi ID sini oladi.
// Token yo'q yoki noto'g'ri bo'lsa null qaytaradi.
export function getUserIdFromRequest(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET sozlanmagan.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}
