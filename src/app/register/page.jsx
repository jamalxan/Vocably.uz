import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: "Ro'yxatdan o'tish — Vocably",
  description: "Bepul Vocably hisobi oching — so'z boyligingizni ilmiy asoslangan takrorlash tizimi bilan quring.",
  robots: { index: false, follow: true },
};

export default function RoyxatPage() {
  return <AuthForm initialMode="register" />;
}
