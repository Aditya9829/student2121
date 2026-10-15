import { useState, useEffect, useCallback } from 'react';
import { Sidebar, TopBar } from '@/components/Layout';
import { ToastContainer, type ToastData } from '@/components/ui/Toast';
import { Dashboard } from '@/pages/Dashboard';
import { StudentsList } from '@/pages/StudentsList';
import { StudentProfile } from '@/pages/StudentProfile';
import { CoursesPage } from '@/pages/CoursesPage';
import { SubjectsPage } from '@/pages/SubjectsPage';
import type { Page } from '@/lib/types';

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  students: 'Students',
  student: 'Student Profile',
  courses: 'Courses',
  subjects: 'Subjects',
};

function App() {
  const [page, setPage] = useState<Page>({ name: 'dashboard' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    function onToast(e: Event) {
      const detail = (e as CustomEvent).detail as ToastData;
      setToasts((prev) => [...prev, detail]);
    }
    window.addEventListener('toast', onToast);
    return () => window.removeEventListener('toast', onToast);
  }, []);

  function navigate(p: Page) {
    setPage(p);
    setSidebarOpen(false);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        current={page}
        onNavigate={navigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onNavigate={navigate}
          title={pageTitles[page.name]}
        />

        <main className="flex-1 px-4 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {page.name === 'dashboard' && <Dashboard onNavigate={navigate} />}
          {page.name === 'students' && <StudentsList onNavigate={navigate} />}
          {page.name === 'student' && <StudentProfile studentId={page.id} onNavigate={navigate} />}
          {page.name === 'courses' && <CoursesPage />}
          {page.name === 'subjects' && <SubjectsPage />}
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
