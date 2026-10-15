export interface Course {
  id: string;
  course_code: string;
  course_name: string;
  department: string;
  duration_years: number;
  num_semesters: number;
  created_at?: string;
}

export interface Subject {
  id: string;
  subject_code: string;
  subject_name: string;
  course_id: string;
  semester: number;
  credits: number;
  faculty: string;
  created_at?: string;
  // Joined fields
  courses?: Course | null;
}

export interface Student {
  id: string;
  student_id: string;
  enrollment_number: string;
  full_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  photo_url: string | null;
  course_id: string | null;
  semester: number;
  section: string | null;
  created_at?: string;
  // Joined fields
  courses?: Course | null;
}

export interface Attendance {
  id: string;
  student_id: string;
  subject_id: string;
  date: string;
  status: 'present' | 'absent';
  created_at?: string;
  // Joined fields
  subjects?: Subject | null;
}

export interface Marks {
  id: string;
  student_id: string;
  subject_id: string;
  internal_marks: number;
  assignment_marks: number;
  exam_marks: number;
  created_at?: string;
  // Joined fields
  subjects?: Subject | null;
}

// Computed helpers
export function totalMarks(m: Marks): number {
  return m.internal_marks + m.assignment_marks + m.exam_marks;
}

export function overallPercentage(marksList: Marks[]): number {
  if (marksList.length === 0) return 0;
  const total = marksList.reduce((sum, m) => sum + totalMarks(m), 0);
  return Math.round((total / (marksList.length * 100)) * 100);
}

export function gradeFromPercentage(pct: number): string {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
}

export function attendancePercentage(records: Attendance[]): number {
  if (records.length === 0) return 0;
  const present = records.filter((r) => r.status === 'present').length;
  return Math.round((present / records.length) * 100);
}

export type Page =
  | { name: 'dashboard' }
  | { name: 'students' }
  | { name: 'student'; id: string }
  | { name: 'courses' }
  | { name: 'subjects' };
