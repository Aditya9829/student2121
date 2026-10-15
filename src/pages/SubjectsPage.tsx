import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Subject, Course } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState, ConfirmDialog } from '@/components/ui/Feedback';
import { PageHeader, SearchInput } from '@/components/ui/SearchInput';
import { useToast } from '@/lib/useToast';

export function SubjectsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const [subRes, courseRes] = await Promise.all([
      supabase.from('subjects').select('*, courses(*)').order('subject_name'),
      supabase.from('courses').select('*').order('course_name'),
    ]);
    setSubjects(subRes.data || []);
    setCourses(courseRes.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm({ subject_code: '', subject_name: '', course_id: '', semester: '1', credits: '3', faculty: '' });
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(subject: Subject) {
    setEditing(subject);
    setForm({
      subject_code: subject.subject_code,
      subject_name: subject.subject_name,
      course_id: subject.course_id || '',
      semester: String(subject.semester),
      credits: String(subject.credits),
      faculty: subject.faculty,
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.subject_code.trim()) e.subject_code = 'Subject code is required';
    if (!form.subject_name.trim()) e.subject_name = 'Subject name is required';
    if (!form.course_id) e.course_id = 'Please select a course';
    if (!form.semester || parseInt(form.semester) < 1) e.semester = 'Must be at least 1';
    if (!form.credits || parseInt(form.credits) < 1) e.credits = 'Must be at least 1';
    if (!form.faculty.trim()) e.faculty = 'Faculty name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);

    const payload = {
      subject_code: form.subject_code.trim().toUpperCase(),
      subject_name: form.subject_name.trim(),
      course_id: form.course_id,
      semester: parseInt(form.semester),
      credits: parseInt(form.credits),
      faculty: form.faculty.trim(),
    };

    if (editing) {
      const { error } = await supabase.from('subjects').update(payload).eq('id', editing.id);
      setSaving(false);
      if (error) {
        showToast('Failed to update subject', 'error');
        return;
      }
      showToast('Subject updated successfully');
    } else {
      const { error } = await supabase.from('subjects').insert(payload);
      setSaving(false);
      if (error) {
        showToast(error.code === '23505' ? 'Subject code already exists' : 'Failed to add subject', 'error');
        return;
      }
      showToast('Subject added successfully');
    }

    setModalOpen(false);
    load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('subjects').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    if (error) {
      showToast('Failed to delete subject', 'error');
      return;
    }
    showToast('Subject deleted successfully');
    setDeleteTarget(null);
    load();
  }

  const filtered = subjects.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.subject_name.toLowerCase().includes(q) ||
      s.subject_code.toLowerCase().includes(q) ||
      s.faculty.toLowerCase().includes(q);
    const matchesCourse = !filterCourse || s.course_id === filterCourse;
    return matchesSearch && matchesCourse;
  });

  const selectedCourse = courses.find((c) => c.id === filterCourse);
  const maxSemesters = selectedCourse?.num_semesters || 10;
  const semesterOptions = Array.from({ length: maxSemesters }, (_, i) => ({
    value: String(i + 1),
    label: `Semester ${i + 1}`,
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Subject Management"
        subtitle={`${subjects.length} subject${subjects.length !== 1 ? 's' : ''} available`}
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Subject
          </Button>
        }
      />

      <Card padding={false}>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by name, code, or faculty..." />
          </div>
          <div className="sm:w-56">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.course_name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<GraduationCap size={28} />}
            title={search || filterCourse ? 'No matching subjects' : 'No subjects yet'}
            message={search || filterCourse ? 'Try adjusting your filters.' : 'Add your first subject to get started.'}
            action={!search && !filterCourse && <Button onClick={openAdd}><Plus size={16} /> Add Subject</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Subject Code</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Subject Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Course</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Sem</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Credits</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Faculty</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3"><Badge color="blue">{s.subject_code}</Badge></td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{s.subject_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{s.courses?.course_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell"><Badge color="teal">{s.semester}</Badge></td>
                    <td className="px-4 py-3 text-center text-sm text-slate-600 hidden sm:table-cell">{s.credits}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">{s.faculty}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Subject' : 'Add Subject'}
        subtitle={editing ? editing.subject_name : 'Create a new subject'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Subject' : 'Add Subject'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Subject Code" value={form.subject_code || ''} onChange={(v) => setForm({ ...form, subject_code: v })} error={errors.subject_code} placeholder="e.g. CS101" required />
          <Input label="Subject Name" value={form.subject_name || ''} onChange={(v) => setForm({ ...form, subject_name: v })} error={errors.subject_name} placeholder="e.g. Data Structures" required />
          <Input
            label="Course"
            value={form.course_id || ''}
            onChange={(v) => setForm({ ...form, course_id: v })}
            error={errors.course_id}
            placeholder="Select course"
            options={courses.map((c) => ({ value: c.id, label: c.course_name }))}
            required
          />
          <Input
            label="Semester"
            value={form.semester || '1'}
            onChange={(v) => setForm({ ...form, semester: v })}
            error={errors.semester}
            options={semesterOptions}
            required
          />
          <Input label="Credits" type="number" min={1} value={form.credits || ''} onChange={(v) => setForm({ ...form, credits: v })} error={errors.credits} required />
          <Input label="Faculty" value={form.faculty || ''} onChange={(v) => setForm({ ...form, faculty: v })} error={errors.faculty} placeholder="e.g. Dr. Rajesh Kumar" required />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Subject"
        message={`Are you sure you want to delete "${deleteTarget?.subject_name}"? This will also remove related marks and attendance records.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
