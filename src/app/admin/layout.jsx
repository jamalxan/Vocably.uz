import { Playfair_Display } from 'next/font/google';
import { AdminProvider } from '@/context/AdminContext';
import AdminGate from '@/components/admin/AdminGate';

// Faqat admin panelga xos hashamatli serif — asosiy ilova shriftlariga tegilmaydi
// (docs/ chat plani, keyingi UI so'rovi: admin panel alohida premium ko'rinishda).
const luxury = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-luxury',
  display: 'swap',
});

export default function AdminLayout({ children }) {
  return (
    <div className={luxury.variable}>
      <AdminProvider>
        <AdminGate>{children}</AdminGate>
      </AdminProvider>
    </div>
  );
}
