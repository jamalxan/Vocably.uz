import { TeacherProvider } from '@/context/TeacherContext';
import TeacherGate from '@/components/teacher/TeacherGate';

// src/app/admin/layout.jsx bilan bir xil gating naqshi — faqat role ===
// 'teacher' bo'lganlarga.
export default function TeacherLayout({ children }) {
  return (
    <TeacherProvider>
      <TeacherGate>{children}</TeacherGate>
    </TeacherProvider>
  );
}
