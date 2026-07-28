import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import Card from './Card';
import Input from './Input';
import Button from './Button';

const AddTaskModal = ({ isOpen, onClose, onAdd }) => {
  const [taskName, setTaskName] = useState('');
  const [clientName, setClientName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskName.trim() || !clientName.trim()) return;

    onAdd({
      id: Date.now(),
      title: taskName,
      client: clientName,
      status: 'To Do',
      priority: 'Medium'
    });

    setTaskName('');
    setClientName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
      <Card className="w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Add New Task</h3>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="task-name"
            label="Task Name"
            required
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="e.g. Design Homepage"
          />

          <Input
            id="task-client"
            label="Client / Project"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. Studio Alpha"
          />

          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2 mt-2"
          >
            <PlusCircle className="w-[18px] h-[18px]" />
            Create Task
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AddTaskModal;
