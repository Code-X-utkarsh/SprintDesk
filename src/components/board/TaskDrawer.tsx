import React, { useState, useEffect } from 'react';
import { useBoardStore } from '../../stores/useBoardStore';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button, Input, CustomSelect } from '../ui';
import type { TaskStatus, TaskPriority } from '../../types';
import { X, Edit2, Trash2, Calendar, Send, Check, Activity } from 'lucide-react';

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

    const authorId = authUser ? authUser.id : 1;
    addComment(selectedTask.id, newCommentMessage.trim(), authorId);
    setNewCommentMessage('');
    toast.success('Comment Added', 'Your comment has been posted.');
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
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="task-drawer-title">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-neutral-900/60 dark:bg-neutral-950/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-lg bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Task-{selectedTask.id} Details
              </p>
              <h2 id="task-drawer-title" className="text-lg font-extrabold text-neutral-900 dark:text-white leading-tight mt-0.5">
                {selectedTask.title}
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant={isEditing ? 'secondary' : 'outline'}
                size="sm"
                leftIcon={isEditing ? <Check className="h-3.5 w-3.5" /> : <Edit2 className="h-3.5 w-3.5" />}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'View' : 'Edit'}
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
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <CustomSelect
                    label="Status"
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

                <div className="grid grid-cols-2 gap-4">
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

                <div className="pt-3 flex justify-end gap-2">
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
                {/* Metadata Details Grid */}
                <div className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-400 font-medium block uppercase tracking-wider">Stage</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 mt-1 block capitalize">
                      {selectedTask.status.replace('-', ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 font-medium block uppercase tracking-wider">Priority</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 mt-1 block capitalize">
                      {selectedTask.priority}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 font-medium block uppercase tracking-wider">Assignee</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {assignee?.avatar ? (
                        <img src={assignee.avatar} alt={assignee.name} className="h-5 w-5 rounded-full object-cover" />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-[9px]">
                          {assignee?.name[0] || 'U'}
                        </div>
                      )}
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                        {assignee?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-neutral-400 font-medium block uppercase tracking-wider">Due Date</span>
                    <div className="flex items-center gap-1 mt-1 text-neutral-800 dark:text-neutral-200 font-semibold">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                      <span>
                        {selectedTask.dueDate
                          ? new Date(selectedTask.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'No due date'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Description
                  </h3>
                  <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {selectedTask.description || 'No description provided for this task.'}
                  </div>
                </div>

                {/* Activity & Comments Thread */}
                <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-indigo-500" />
                      <span>Task Comments ({taskComments.length})</span>
                    </h3>
                  </div>

                  {/* Comment List */}
                  <div className="space-y-3">
                    {taskComments.map((comment) => {
                      const author = users.find((u) => u.id === comment.authorId);
                      return (
                        <div key={comment.id} className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                              {author?.avatar && (
                                <img src={author.avatar} alt={author.name} className="h-4 w-4 rounded-full" />
                              )}
                              <span>{author ? author.name : 'Team Member'}</span>
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-normal pl-5">
                            {comment.message}
                          </p>
                        </div>
                      );
                    })}

                    {taskComments.length === 0 && (
                      <p className="text-xs text-neutral-400 italic py-1">No comments logged yet. Start the conversation below.</p>
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
