import { useEffect, useState } from 'react';
import { Eye, Users, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Student, Page } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/Feedback';
import { PageHeader, SearchInput } from '@/components/ui/SearchInput';

interface StudentsListProps {
  onNavigate: (page: Page) => void;
}

export function StudentsList({ onNavigate }: StudentsListProps) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('students')
        .select('*, courses(*)')
        .order('full_name', { ascending: true });
      if (error) {
        console.error(error);
      }
      setStudents(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.full_name.toLowerCase().includes(q) ||
      s.student_id.toLowerCase().includes(q) ||
      s.enrollment_number.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.courses?.course_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Students"
        subtitle={`${students.length} student${students.length !== 1 ? 's' : ''} enrolled`}
      />

      <Card padding={false}>
        <div className="p-4 border-b border-slate-100">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, ID, enrollment number, email, or course..."
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title={search ? 'No matching students' : 'No students enrolled'}
            message={search ? 'Try adjusting your search terms.' : 'Students will appear here once enrolled.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Student ID</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Enrollment</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Course</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Semester</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name)}`}
                          alt={s.full_name}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{s.full_name}</p>
                          <p className="text-xs text-slate-500 truncate">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-700">{s.student_id}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{s.enrollment_number}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-slate-600">{s.courses?.course_name || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge color="teal">Sem {s.semester}</Badge>
                      {s.section && <span className="ml-2 text-xs text-slate-400">Sec {s.section}</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onNavigate({ name: 'student', id: s.id })}
                        className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-brand-50"
                      >
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
