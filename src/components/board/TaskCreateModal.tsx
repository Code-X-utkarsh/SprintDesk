import React, { useState } from 'react';
import { Modal, Button, Input, CustomSelect } from '../ui';
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
    label: u.name,
    avatar: u.avatar,
    description: `@${u.email.split('@')[0]}`,
  }));

  const statusOptions = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' },
  ];

  const priorityOptions = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

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
          <div role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Describe the task objective and acceptance criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomSelect
            label="Initial Status"
            value={status}
            onChange={(val) => setStatus(val as TaskStatus)}
            options={statusOptions}
          />

          <CustomSelect
            label="Priority"
            value={priority}
            onChange={(val) => setPriority(val as TaskPriority)}
            options={priorityOptions}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomSelect
            label="Assignee"
            value={assigneeId}
            onChange={(val) => setAssigneeId(Number(val))}
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
