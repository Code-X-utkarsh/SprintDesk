import React from 'react';
import { Modal, Button } from '../ui';
import { useBoardStore } from '../../stores/useBoardStore';
import { useToast } from '../../hooks/useToast';
import { AlertTriangle } from 'lucide-react';

export const DeleteTaskConfirmModal: React.FC = () => {
  const { isDeleteModalOpen, selectedTaskId, tasks, deleteTask, closeDeleteModal } = useBoardStore();
  const { toast } = useToast();

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  if (!selectedTaskId || !selectedTask) return null;

  const handleConfirmDelete = () => {
    deleteTask(selectedTaskId);
    toast.success('Task Deleted', `'${selectedTask.title}' was deleted successfully.`);
  };

  return (
    <Modal
      isOpen={isDeleteModalOpen}
      onClose={closeDeleteModal}
      title="Delete Task Confirmation"
      description="This action cannot be undone. Are you sure you want to permanently delete this task?"
      footer={
        <>
          <Button variant="ghost" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirmDelete}>
            Delete Permanently
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50">
        <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div className="text-xs text-rose-900 dark:text-rose-200">
          <p className="font-semibold">Target Task:</p>
          <p className="mt-0.5 font-mono text-slate-800 dark:text-slate-100">"{selectedTask.title}"</p>
        </div>
      </div>
    </Modal>
  );
};
