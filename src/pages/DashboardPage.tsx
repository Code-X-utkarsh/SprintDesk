import React, { useState } from 'react';
import { Button, Select, Modal, DataTable, type ColumnDef } from '../components/ui';
import { useToast } from '../hooks/useToast';
import { Sparkles, Layers, CheckCircle2, Clock } from 'lucide-react';

interface QuickTaskDemo {
  id: number;
  title: string;
  sprint: string;
  status: string;
  priority: string;
}

const demoTasks: QuickTaskDemo[] = [
  { id: 1, title: 'Implement authentication flow', sprint: 'Sprint 3', status: 'Done', priority: 'High' },
  { id: 2, title: 'Build Kanban board foundation', sprint: 'Sprint 3', status: 'In Progress', priority: 'High' },
  { id: 3, title: 'Create reusable UI component system', sprint: 'Sprint 3', status: 'Done', priority: 'Medium' },
  { id: 4, title: 'Design notification system', sprint: 'Sprint 3', status: 'Backlog', priority: 'Low' },
];

export const DashboardPage: React.FC = () => {
  const { toast } = useToast();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState('3');

  const columns: ColumnDef<QuickTaskDemo>[] = [
    { header: 'Task Title', accessorKey: 'title', className: 'font-medium text-slate-900 dark:text-white' },
    { header: 'Sprint', accessorKey: 'sprint' },
    {
      header: 'Status',
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            row.status === 'Done'
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : row.status === 'In Progress'
              ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    { header: 'Priority', accessorKey: 'priority' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sprint Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Engineering team progress metrics and design system component primitives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            options={[
              { value: '1', label: 'Sprint 1' },
              { value: '2', label: 'Sprint 2' },
              { value: '3', label: 'Sprint 3 (Active)' },
            ]}
            value={selectedSprint}
            onChange={(e) => setSelectedSprint(e.target.value)}
            className="w-40"
          />

          <Button
            variant="primary"
            leftIcon={<Sparkles className="h-4 w-4" />}
            onClick={() => {
              setIsDemoModalOpen(true);
              toast.info('Modal opened', 'Testing design system modal primitive');
            }}
          >
            Test Modal Primitive
          </Button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Sprint
            </span>
            <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Sprint {selectedSprint}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Aug 17 - Aug 28, 2026</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Sprint Tasks
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">30 Tasks</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Mock dataset initialized</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Toast System Demo
            </span>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Action Completed', 'Task status updated successfully!')}
            >
              Toast Success
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => toast.error('API Error', 'Failed to update remote state.')}
            >
              Toast Error
            </Button>
          </div>
        </div>
      </div>

      {/* DataTable Demo */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
          Reusable DataTable Component Demonstration
        </h2>
        <DataTable columns={columns} data={demoTasks} />
      </div>

      {/* Modal Primitive Demonstration */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="Reusable Modal Component"
        description="This modal primitive manages focus, traps tab navigation, listens for Escape key closes, and locks body scrolling."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDemoModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsDemoModalOpen(false);
                toast.success('Confirmed', 'Modal confirmed successfully!');
              }}
            >
              Confirm Action
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            The Modal component is a pure UI primitive designed for SprintDesk. It can be composed
            later for delete confirmations, task creation forms, and details drawers.
          </p>
        </div>
      </Modal>
    </div>
  );
};
