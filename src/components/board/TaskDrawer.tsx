import React, { useState, useEffect } from 'react';
import { useBoardStore } from '../../stores/useBoardStore';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button, Input, Select } from '../ui';
import type { TaskStatus, TaskPriority } from '../../types';
import { X, Edit2, Trash2, Calendar, MessageSquare, Send, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export const TaskDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    selectedTaskId,
    tasks,
    users,
    comments,
    closeDrawer,
    updateTask,
    addComment,
    openDeleteModal,
  } = useBoardStore();

  const { user: authUser } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [newCommentMessage, setNewCommentMessage] = useState('');

  // Form state for edit mode
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<number>(1);
  const [dueDate, setDueDate] = useState('');

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // Synchronize edit form fields when selected task changes
  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title);
      setDescription(selectedTask.description || '');
      setStatus(selectedTask.status);
      setPriority(selectedTask.priority);
      setAssigneeId(selectedTask.assigneeId);
      setDueDate(selectedTask.dueDate || '');
      setIsEditing(false);
    }
  }, [selectedTask]);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen || !selectedTask) return null;

  const assignee = users.find((u) => u.id === selectedTask.assigneeId);
  const taskComments = comments.filter((c) => c.taskId === selectedTask.id);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateTask(selectedTask.id, {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeId: Number(assigneeId),
      dueDate,
    });

    toast.success('Task Updated', `'${title.trim()}' was updated successfully.`);
    setIsEditing(false);
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentMessage.trim()) return;

    // Use logged-in user id or default fallback
    const authorId = authUser ? authUser.id : 1;
    addComment(selectedTask.id, newCommentMessage.trim(), authorId);
    setNewCommentMessage('');
    toast.success('Comment Added', 'Your comment has been posted.');
  };

  const userOptions = users.map((u) => ({
    value: u.id,
    label: `${u.name} (@${u.email.split('@')[0]})`,
  }));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="task-drawer-title">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Task-{selectedTask.id}
              </span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-semibold uppercase border',
                  selectedTask.priority === 'high'
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    : selectedTask.priority === 'medium'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                )}
              >
                {selectedTask.priority}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isEditing ? 'secondary' : 'outline'}
                size="sm"
                leftIcon={isEditing ? <Check className="h-3.5 w-3.5" /> : <Edit2 className="h-3.5 w-3.5" />}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'View Mode' : 'Edit Task'}
              </Button>

              <Button
                variant="destructive"
                size="sm"
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={openDeleteModal}
              >
                Delete
              </Button>

              <button
                onClick={closeDrawer}
                aria-label="Close drawer"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isEditing ? (
              /* EDIT MODE FORM */
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <Input
                  label="Task Title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Status"
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
                      { value: 'high', label: 'High' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'low', label: 'Low' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                <div className="pt-2 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              /* VIEW MODE DETAILS */
              <div className="space-y-6">
                <div>
                  <h2 id="task-drawer-title" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {selectedTask.title}
                  </h2>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block uppercase tracking-wider">Status</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block capitalize">
                      {selectedTask.status.replace('-', ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block uppercase tracking-wider">Assignee</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {assignee?.avatar ? (
                        <img src={assignee.avatar} alt={assignee.name} className="h-5 w-5 rounded-full object-cover" />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[9px]">
                          {assignee?.name[0] || 'U'}
                        </div>
                      )}
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {assignee?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block uppercase tracking-wider">Due Date</span>
                    <div className="flex items-center gap-1 mt-1 text-slate-800 dark:text-slate-200 font-semibold">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{selectedTask.dueDate || 'No due date'}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Description
                  </h3>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedTask.description || 'No description provided for this task.'}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" />
                      <span>Activity & Comments ({taskComments.length})</span>
                    </h3>
                  </div>

                  {/* Comment List */}
                  <div className="space-y-3">
                    {taskComments.map((comment) => {
                      const author = users.find((u) => u.id === comment.authorId);
                      return (
                        <div key={comment.id} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {author ? author.name : 'Team Member'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                            {comment.message}
                          </p>
                        </div>
                      );
                    })}

                    {taskComments.length === 0 && (
                      <p className="text-xs text-slate-400 italic py-2">No comments yet. Start the conversation below.</p>
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddCommentSubmit} className="flex gap-2 pt-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newCommentMessage}
                      onChange={(e) => setNewCommentMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" variant="primary" size="md" rightIcon={<Send className="h-4 w-4" />}>
                      Post
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
