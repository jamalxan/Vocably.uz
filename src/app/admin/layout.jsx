import { AdminProvider } from '@/context/AdminContext';
import AdminGate from '@/components/admin/AdminGate';

// Playfair Display (font-luxury) endi src/app/layout.jsx'da global yuklanadi —
// butun ilova bo'ylab bitta brend ovozi (docs/ premium UI so'rovi).
export default function AdminLayout({ children }) {
  return (
    <AdminProvider>
      <AdminGate>{children}</AdminGate>
    </AdminProvider>
  );
}
