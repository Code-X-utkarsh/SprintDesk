import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Button, Input, Select, Modal, DataTable, type ColumnDef } from '../components/ui';
import { useToastStore } from '../stores/useToastStore';
import { useToast } from '../hooks/useToast';
import React from 'react';

// Wrapper component to test useToast hook
const ToastTestComponent: React.FC = () => {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast.success('Test Success', 'Operation worked')}>Trigger Toast</button>
    </div>
  );
};

describe('Design System UI Primitives Test Suite', () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts();
  });

  describe('Button Component', () => {
    it('renders button with children and variant classes', () => {
      render(<Button variant="destructive">Delete Item</Button>);
      const button = screen.getByRole('button', { name: 'Delete Item' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-rose-600');
    });

    it('triggers onClick handler when enabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      fireEvent.click(screen.getByRole('button', { name: 'Click Me' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disables button and prevents clicks when disabled prop is true', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
      const button = screen.getByRole('button', { name: 'Disabled Button' });
      expect(button).toBeDisabled();
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders spinner and disables button when isLoading is true', () => {
      const handleClick = vi.fn();
      render(<Button isLoading onClick={handleClick}>Submitting</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Input Component', () => {
    it('associates label with input element via id', () => {
      render(<Input label="Email Address" id="email-field" />);
      const label = screen.getByText('Email Address');
      const input = screen.getByLabelText('Email Address');
      expect(label).toHaveAttribute('for', 'email-field');
      expect(input).toHaveAttribute('id', 'email-field');
    });

    it('renders error message banner and aria-invalid attribute', () => {
      render(<Input label="Username" error="Username is required" />);
      const input = screen.getByLabelText('Username');
      const errorMessage = screen.getByRole('alert');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(errorMessage).toHaveTextContent('Username is required');
    });
  });

  describe('Select Component', () => {
    it('renders select dropdown options correctly', () => {
      const options = [
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt2', label: 'Option 2' },
      ];
      render(<Select label="Select Option" options={options} value="opt1" onChange={() => {}} />);
      const select = screen.getByLabelText('Select Option');
      expect(select).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('Modal Component', () => {
    it('renders accessible dialog elements when open', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Confirm Deletion" description="Are you sure?">
          <p>Modal body content</p>
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
      expect(screen.getByText('Modal body content')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}} title="Closed Modal">
          <p>Hidden content</p>
        </Modal>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('triggers onClose when Escape key is pressed', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Escape Test">
          <p>Content</p>
        </Modal>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Toast & useToast System', () => {
    it('adds and clears toasts in toast store', () => {
      render(<ToastTestComponent />);
      fireEvent.click(screen.getByRole('button', { name: 'Trigger Toast' }));

      const toasts = useToastStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].title).toBe('Test Success');
      expect(toasts[0].message).toBe('Operation worked');

      act(() => {
        useToastStore.getState().removeToast(toasts[0].id);
      });
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });

  describe('DataTable Component', () => {
    interface TestData {
      id: number;
      name: string;
    }

    const columns: ColumnDef<TestData>[] = [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Name', accessorKey: 'name' },
    ];

    it('renders headers and table rows correctly', () => {
      const data: TestData[] = [
        { id: 1, name: 'Task Alpha' },
        { id: 2, name: 'Task Beta' },
      ];
      render(<DataTable columns={columns} data={data} />);

      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Task Alpha')).toBeInTheDocument();
      expect(screen.getByText('Task Beta')).toBeInTheDocument();
    });

    it('renders empty message when data array is empty', () => {
      render(<DataTable columns={columns} data={[]} emptyMessage="No sprint records available" />);
      expect(screen.getByText('No sprint records available')).toBeInTheDocument();
    });
  });
});
