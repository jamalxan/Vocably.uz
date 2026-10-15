import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Tizimga kirish — Vocably',
  description: "Vocably hisobingizga kiring va ingliz tili o'rganishni davom ettiring.",
  robots: { index: false, follow: true }, // shaxsiy hisob sahifasi — qidiruvda ko'rinishi shart emas
};

export default function KirishPage() {
  return <AuthForm initialMode="login" />;
}
