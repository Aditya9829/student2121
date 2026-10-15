import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Course, Student, Subject } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/Badge';
import type { Page } from '@/lib/types';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);

  useEffect(() => {
    async function load() {
      const [s, c, sub] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*'),
        supabase.from('subjects').select('*', { count: 'exact', head: true }),
      ]);

      setCourses(c.data || []);
      setSubjects([]);

      const [{ count: studentCount }, { count: subjectCount }, recent] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('subjects').select('*', { count: 'exact', head: true }),
        supabase
          .from('students')
          .select('*, courses(*)')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setStudents(Array(studentCount).fill(0));
      setSubjects(Array(subjectCount).fill(0));
      setRecentStudents(recent.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const stats = [
    {
      label: 'Total Students',
      value: students.length,
      icon: Users,
      color: 'bg-brand-50 text-brand-600',
      page: { name: 'students' } as Page,
    },
    {
      label: 'Total Courses',
      value: courses.length,
      icon: BookOpen,
      color: 'bg-emerald-50 text-emerald-600',
      page: { name: 'courses' } as Page,
    },
    {
      label: 'Total Subjects',
      value: subjects.length,
      icon: GraduationCap,
      color: 'bg-amber-50 text-amber-600',
      page: { name: 'subjects' } as Page,
    },
    {
      label: 'Departments',
      value: new Set(courses.map((c) => c.department)).size,
      icon: TrendingUp,
      color: 'bg-teal-50 text-teal-600',
      page: { name: 'courses' } as Page,
    },
  ];

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Overview of your institution" />
        <div className="flex items-center justify-center py-20">
          <Spinner size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dashboard" subtitle="Overview of your institution" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={() => onNavigate(stat.page)}
              className="text-left"
            >
              <Card className="hover:shadow-md hover:border-slate-300 transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      {/* Courses Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">Active Courses</h3>
            <button
              onClick={() => onNavigate({ name: 'courses' })}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{course.course_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{course.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color="blue">{course.num_semesters} sem</Badge>
                  <Badge color="slate">{course.duration_years} yr</Badge>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No courses yet</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">Recent Students</h3>
            <button
              onClick={() => onNavigate({ name: 'students' })}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {recentStudents.map((s) => (
              <button
                key={s.id}
                onClick={() => onNavigate({ name: 'student', id: s.id })}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-left"
              >
                <img
                  src={s.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name)}`}
                  alt={s.full_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{s.full_name}</p>
                  <p className="text-xs text-slate-500">{s.student_id} · {s.courses?.course_name || 'N/A'}</p>
                </div>
                <Badge color="teal">Sem {s.semester}</Badge>
              </button>
            ))}
            {recentStudents.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No students yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
