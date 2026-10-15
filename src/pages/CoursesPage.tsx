import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Course } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState, ConfirmDialog } from '@/components/ui/Feedback';
import { PageHeader, SearchInput } from '@/components/ui/SearchInput';
import { useToast } from '@/lib/useToast';

export function CoursesPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('courses').select('*').order('course_name');
    setCourses(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm({ course_code: '', course_name: '', department: '', duration_years: '4', num_semesters: '8' });
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(course: Course) {
    setEditing(course);
    setForm({
      course_code: course.course_code,
      course_name: course.course_name,
      department: course.department,
      duration_years: String(course.duration_years),
      num_semesters: String(course.num_semesters),
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.course_code.trim()) e.course_code = 'Course ID is required';
    if (!form.course_name.trim()) e.course_name = 'Course name is required';
    if (!form.department.trim()) e.department = 'Department is required';
    if (!form.duration_years || parseInt(form.duration_years) < 1) e.duration_years = 'Must be at least 1';
    if (!form.num_semesters || parseInt(form.num_semesters) < 1) e.num_semesters = 'Must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);

    const payload = {
      course_code: form.course_code.trim().toUpperCase(),
      course_name: form.course_name.trim(),
      department: form.department.trim(),
      duration_years: parseInt(form.duration_years),
      num_semesters: parseInt(form.num_semesters),
    };

    if (editing) {
      const { error } = await supabase.from('courses').update(payload).eq('id', editing.id);
      setSaving(false);
      if (error) {
        showToast('Failed to update course', 'error');
        return;
      }
      showToast('Course updated successfully');
    } else {
      const { error } = await supabase.from('courses').insert(payload);
      setSaving(false);
      if (error) {
        showToast(error.code === '23505' ? 'Course ID already exists' : 'Failed to add course', 'error');
        return;
      }
      showToast('Course added successfully');
    }

    setModalOpen(false);
    load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('courses').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    if (error) {
      showToast('Failed to delete course', 'error');
      return;
    }
    showToast('Course deleted successfully');
    setDeleteTarget(null);
    load();
  }

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.course_name.toLowerCase().includes(q) ||
      c.course_code.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Course Management"
        subtitle={`${courses.length} course${courses.length !== 1 ? 's' : ''} available`}
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Course
          </Button>
        }
      />

      <Card padding={false}>
        <div className="p-4 border-b border-slate-100">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, ID, or department..." />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={28} />}
            title={search ? 'No matching courses' : 'No courses yet'}
            message={search ? 'Try adjusting your search.' : 'Add your first course to get started.'}
            action={!search && <Button onClick={openAdd}><Plus size={16} /> Add Course</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Course ID</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Course Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Department</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Duration</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Semesters</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3"><Badge color="blue">{c.course_code}</Badge></td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{c.course_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{c.department}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-600 hidden sm:table-cell">{c.duration_years} yr</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell"><Badge color="slate">{c.num_semesters}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
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
        title={editing ? 'Edit Course' : 'Add Course'}
        subtitle={editing ? editing.course_name : 'Create a new academic program'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Course' : 'Add Course'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Course ID" value={form.course_code || ''} onChange={(v) => setForm({ ...form, course_code: v })} error={errors.course_code} placeholder="e.g. BTECH-CS" required />
          <Input label="Course Name" value={form.course_name || ''} onChange={(v) => setForm({ ...form, course_name: v })} error={errors.course_name} placeholder="e.g. B.Tech Computer Science" required />
          <Input label="Department" value={form.department || ''} onChange={(v) => setForm({ ...form, department: v })} error={errors.department} placeholder="e.g. Computer Science" required />
          <Input label="Duration (Years)" type="number" min={1} value={form.duration_years || ''} onChange={(v) => setForm({ ...form, duration_years: v })} error={errors.duration_years} required />
          <div className="sm:col-span-2">
            <Input label="Number of Semesters" type="number" min={1} value={form.num_semesters || ''} onChange={(v) => setForm({ ...form, num_semesters: v })} error={errors.num_semesters} required />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteTarget?.course_name}"? This will also remove all subjects linked to this course.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
