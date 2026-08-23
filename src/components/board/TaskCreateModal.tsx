import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '../ui';
import { useBoardStore } from '../../stores/useBoardStore';
import { useToast } from '../../hooks/useToast';
import type { TaskStatus, TaskPriority } from '../../types';

export const TaskCreateModal: React.FC = () => {
  const { isCreateModalOpen, users, addTask, closeCreateModal } = useBoardStore();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<number>(users[0]?.id || 1);
  const [dueDate, setDueDate] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError('Task title is required.');
      return;
    }

    const newTask = addTask({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeId: Number(assigneeId),
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      sprintId: 3, // Current active sprint
    });

    toast.success('Task Created', `'${newTask.title}' was added to the board.`);
    closeCreateModal();

    // Reset form state
    setTitle('');
    setDescription('');
    setStatus('backlog');
    setPriority('medium');
    setDueDate('');
  };

  const userOptions = users.map((u) => ({
    value: u.id,
    label: `${u.name} (@${u.email.split('@')[0]})`,
  }));

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={closeCreateModal}
      title="Create New Sprint Task"
      description="Add a new task item to the active sprint board."
      footer={
        <>
          <Button variant="ghost" onClick={closeCreateModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create Task
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {validationError && (
          <div role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400 p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
            {validationError}
          </div>
        )}

        <Input
          label="Task Title"
          required
          placeholder="e.g. Implement authentication interceptor"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Describe the task objective and acceptance criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Initial Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={[
              { value: 'backlog', label: 'Backlog' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'review', label: 'Review' },
              { value: 'done', label: 'Done' },
            ]}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={[
              { value: 'high', label: 'High Priority' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'low', label: 'Low Priority' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(Number(e.target.value))}
            options={userOptions}
          />

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
