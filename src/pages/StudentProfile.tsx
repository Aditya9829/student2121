import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  CalendarDays,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Student, Subject, Attendance, Marks, Course, Page } from '@/lib/types';
import {
  totalMarks,
  overallPercentage,
  gradeFromPercentage,
  attendancePercentage,
} from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/Feedback';
import { useToast } from '@/lib/useToast';

interface StudentProfileProps {
  studentId: string;
  onNavigate: (page: Page) => void;
}

type Tab = 'overview' | 'attendance' | 'marks' | 'subjects' | 'assignments';

const tabs: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'marks', label: 'Marks' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'assignments', label: 'Assignments' },
];

export function StudentProfile({ studentId, onNavigate }: StudentProfileProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [marks, setMarks] = useState<Marks[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const [sRes, cRes] = await Promise.all([
        supabase.from('students').select('*, courses(*)').eq('id', studentId).maybeSingle(),
        supabase.from('courses').select('*').order('course_name'),
      ]);

      if (!sRes.data) {
        setLoading(false);
        return;
      }

      setStudent(sRes.data);
      setCourses(cRes.data || []);

      const [subRes, attRes, marksRes] = await Promise.all([
        supabase
          .from('subjects')
          .select('*, courses(*)')
          .eq('course_id', sRes.data.course_id)
          .eq('semester', sRes.data.semester),
        supabase
          .from('attendance')
          .select('*, subjects(*)')
          .eq('student_id', studentId)
          .order('date', { ascending: false }),
        supabase
          .from('marks')
          .select('*, subjects(*)')
          .eq('student_id', studentId),
      ]);

      setSubjects(subRes.data || []);
      setAttendance(attRes.data || []);
      setMarks(marksRes.data || []);
      setLoading(false);
    }
    load();
  }, [studentId]);

  function openEdit() {
    if (!student) return;
    setEditForm({
      full_name: student.full_name,
      email: student.email,
      phone: student.phone || '',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || '',
      address: student.address || '',
      course_id: student.course_id || '',
      semester: String(student.semester),
      section: student.section || '',
      phone_orig: student.phone || '',
    });
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!student) return;
    setSaving(true);
    const { error } = await supabase
      .from('students')
      .update({
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone || null,
        date_of_birth: editForm.date_of_birth || null,
        gender: editForm.gender || null,
        address: editForm.address || null,
        course_id: editForm.course_id || null,
        semester: parseInt(editForm.semester) || 1,
        section: editForm.section || null,
      })
      .eq('id', student.id);

    setSaving(false);
    if (error) {
      showToast('Failed to save changes. Please try again.', 'error');
      return;
    }
    showToast('Student profile updated successfully');
    setEditOpen(false);
    // Reload
    const { data } = await supabase
      .from('students')
      .select('*, courses(*)')
      .eq('id', studentId)
      .maybeSingle();
    if (data) setStudent(data);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  if (!student) {
    return (
      <EmptyState
        icon={<User size={28} />}
        title="Student not found"
        message="This student profile may have been removed."
        action={
          <Button onClick={() => onNavigate({ name: 'students' })}>
            <ArrowLeft size={16} /> Back to Students
          </Button>
        }
      />
    );
  }

  const pct = overallPercentage(marks);
  const grade = gradeFromPercentage(pct);
  const attPct = attendancePercentage(attendance);
  const selectedCourse = courses.find((c) => c.id === student.course_id);

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => onNavigate({ name: 'students' })}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 font-medium"
      >
        <ArrowLeft size={16} /> Back to Students
      </button>

      {/* Profile Header */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <img
            src={student.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name)}&size=200`}
            alt={student.full_name}
            className="w-28 h-28 rounded-xl object-cover flex-shrink-0 mx-auto sm:mx-0"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-slate-800">{student.full_name}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {student.student_id} · {student.enrollment_number}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
              <Badge color="blue">{selectedCourse?.course_name || 'No course'}</Badge>
              <Badge color="teal">Semester {student.semester}</Badge>
              {student.section && <Badge color="slate">Section {student.section}</Badge>}
            </div>
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={openEdit}>
                <Pencil size={15} /> Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab student={student} course={selectedCourse} subjects={subjects} marks={marks} attendance={attendance} pct={pct} grade={grade} attPct={attPct} />
      )}
      {activeTab === 'attendance' && <AttendanceTab attendance={attendance} attPct={attPct} />}
      {activeTab === 'marks' && <MarksTab marks={marks} pct={pct} grade={grade} />}
      {activeTab === 'subjects' && <SubjectsTab subjects={subjects} />}
      {activeTab === 'assignments' && <AssignmentsTab marks={marks} />}

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Student Profile"
        subtitle={student.full_name}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={editForm.full_name || ''} onChange={(v) => setEditForm({ ...editForm, full_name: v })} required />
          <Input label="Email" type="email" value={editForm.email || ''} onChange={(v) => setEditForm({ ...editForm, email: v })} required />
          <Input label="Phone" value={editForm.phone || ''} onChange={(v) => setEditForm({ ...editForm, phone: v })} />
          <Input label="Date of Birth" type="date" value={editForm.date_of_birth || ''} onChange={(v) => setEditForm({ ...editForm, date_of_birth: v })} />
          <Input
            label="Gender"
            value={editForm.gender || ''}
            onChange={(v) => setEditForm({ ...editForm, gender: v })}
            placeholder="Select gender"
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <Input
            label="Course"
            value={editForm.course_id || ''}
            onChange={(v) => setEditForm({ ...editForm, course_id: v })}
            placeholder="Select course"
            options={courses.map((c) => ({ value: c.id, label: c.course_name }))}
          />
          <Input
            label="Semester"
            type="number"
            min={1}
            value={editForm.semester || '1'}
            onChange={(v) => setEditForm({ ...editForm, semester: v })}
          />
          <Input label="Section" value={editForm.section || ''} onChange={(v) => setEditForm({ ...editForm, section: v })} />
          <div className="sm:col-span-2">
            <Textarea label="Address" value={editForm.address || ''} onChange={(v) => setEditForm({ ...editForm, address: v })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// --- Overview Tab ---
function OverviewTab({
  student,
  course,
  subjects,
  marks,
  attendance,
  pct,
  grade,
  attPct,
}: {
  student: Student;
  course?: Course;
  subjects: Subject[];
  marks: Marks[];
  attendance: Attendance[];
  pct: number;
  grade: string;
  attPct: number;
}) {
  const infoItems = [
    { icon: User, label: 'Student ID', value: student.student_id },
    { icon: GraduationCap, label: 'Enrollment Number', value: student.enrollment_number },
    { icon: Mail, label: 'Email', value: student.email },
    { icon: Phone, label: 'Phone', value: student.phone || 'N/A' },
    { icon: Calendar, label: 'Date of Birth', value: student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A' },
    { icon: User, label: 'Gender', value: student.gender || 'N/A' },
    { icon: MapPin, label: 'Address', value: student.address || 'N/A' },
    { icon: BookOpen, label: 'Course', value: course?.course_name || 'N/A' },
    { icon: BookOpen, label: 'Semester', value: `Semester ${student.semester}` },
    { icon: User, label: 'Section', value: student.section || 'N/A' },
  ];

  const statCards = [
    { label: 'Overall Percentage', value: `${pct}%`, icon: TrendingUp, color: 'text-brand-600 bg-brand-50' },
    { label: 'Grade', value: grade, icon: Award, color: 'text-amber-600 bg-amber-50' },
    { label: 'Attendance', value: `${attPct}%`, icon: CalendarDays, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Subjects', value: String(subjects.length), icon: BookOpen, color: 'text-teal-600 bg-teal-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Academic Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Student Information */}
      <Card>
        <h3 className="text-base font-semibold text-slate-800 mb-4">Student Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {infoItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={15} className="text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-medium text-slate-800 break-words">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Summary of Marks */}
      {marks.length > 0 && (
        <Card>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Academic Summary</h3>
          <div className="space-y-3">
            {marks.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-sm font-medium text-slate-700">{m.subjects?.subject_name || 'Unknown'}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">{totalMarks(m)}/100</span>
                  <Badge color={totalMarks(m) >= 50 ? 'green' : 'red'}>
                    {gradeFromPercentage(totalMarks(m))}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// --- Attendance Tab ---
function AttendanceTab({ attendance, attPct }: { attendance: Attendance[]; attPct: number }) {
  const present = attendance.filter((a) => a.status === 'present').length;
  const absent = attendance.filter((a) => a.status === 'absent').length;

  // Group by subject
  const bySubject: Record<string, Attendance[]> = {};
  attendance.forEach((a) => {
    const key = a.subjects?.subject_name || 'Unknown';
    if (!bySubject[key]) bySubject[key] = [];
    bySubject[key].push(a);
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{present}</p>
              <p className="text-xs text-slate-500">Days Present</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
              <XCircle size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{absent}</p>
              <p className="text-xs text-slate-500">Days Absent</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center">
              <CalendarDays size={24} className="text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{attPct}%</p>
              <p className="text-xs text-slate-500">Attendance Rate</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Per-subject attendance */}
      <div className="space-y-3">
        {Object.entries(bySubject).map(([subjectName, records]) => {
          const subPct = attendancePercentage(records);
          const subPresent = records.filter((r) => r.status === 'present').length;
          return (
            <Card key={subjectName}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{subjectName}</p>
                  <p className="text-xs text-slate-500">{subPresent}/{records.length} classes attended</p>
                </div>
                <Badge color={subPct >= 75 ? 'green' : subPct >= 50 ? 'amber' : 'red'}>{subPct}%</Badge>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${subPct >= 75 ? 'bg-emerald-500' : subPct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${subPct}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {attendance.length === 0 && (
        <EmptyState
          icon={<CalendarDays size={28} />}
          title="No attendance records"
          message="Attendance data will appear here once records are added."
        />
      )}
    </div>
  );
}

// --- Marks Tab ---
function MarksTab({ marks, pct, grade }: { marks: Marks[]; pct: number; grade: string }) {
  if (marks.length === 0) {
    return (
      <EmptyState
        icon={<TrendingUp size={28} />}
        title="No marks recorded"
        message="Academic marks will appear here once they are added."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-brand-600">{pct}%</p>
          <p className="text-sm text-slate-500 mt-1">Overall Percentage</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-amber-600">{grade}</p>
          <p className="text-sm text-slate-500 mt-1">Overall Grade</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-slate-800">{marks.length}</p>
          <p className="text-sm text-slate-500 mt-1">Subjects Evaluated</p>
        </Card>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Subject</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Internal (20)</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Assignment (20)</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Exam (60)</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Total (100)</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {marks.map((m) => {
                const t = totalMarks(m);
                const g = gradeFromPercentage(t);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800">{m.subjects?.subject_name || 'N/A'}</p>
                      <p className="text-xs text-slate-400">{m.subjects?.subject_code}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">{m.internal_marks}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">{m.assignment_marks}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">{m.exam_marks}</td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-slate-800">{t}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge color={t >= 90 ? 'green' : t >= 50 ? 'blue' : 'red'}>{g}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// --- Subjects Tab ---
function SubjectsTab({ subjects }: { subjects: Subject[] }) {
  if (subjects.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen size={28} />}
        title="No subjects enrolled"
        message="Subjects will appear here based on the student's course and semester."
      />
    );
  }

  return (
    <Card padding={false}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Subject Code</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Subject Name</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Credits</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Faculty</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Semester</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {subjects.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <Badge color="blue">{s.subject_code}</Badge>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{s.subject_name}</td>
                <td className="px-4 py-3 text-center text-sm text-slate-700 hidden sm:table-cell">{s.credits}</td>
                <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{s.faculty}</td>
                <td className="px-4 py-3 text-center">
                  <Badge color="teal">{s.semester}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// --- Assignments Tab ---
function AssignmentsTab({ marks }: { marks: Marks[] }) {
  if (marks.length === 0) {
    return (
      <EmptyState
        icon={<Award size={28} />}
        title="No assignment marks"
        message="Assignment marks will appear here once they are evaluated."
      />
    );
  }

  return (
    <div className="space-y-4">
      {marks.map((m) => {
        const pct = Math.round((m.assignment_marks / 20) * 100);
        return (
          <Card key={m.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{m.subjects?.subject_name || 'N/A'}</p>
                <p className="text-xs text-slate-500">{m.subjects?.subject_code}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-800">{m.assignment_marks}<span className="text-sm text-slate-400">/20</span></p>
                <Badge color={pct >= 75 ? 'green' : pct >= 50 ? 'amber' : 'red'}>{pct}%</Badge>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
