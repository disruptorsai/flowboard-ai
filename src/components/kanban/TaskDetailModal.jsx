import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Save, Trash2, X, Calendar as CalendarIcon, Sparkles, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';

export default function TaskDetailModal({ task, open, onClose, onUpdate, onDelete }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setStatus(task.status || 'todo');
      setDueDate(task.due_date ? new Date(task.due_date) : null);
      setAssignedTo(task.assigned_to || '');
    }
  }, [task]);

  const handleAiPrioritize = async () => {
    if (!title.trim()) return;
    
    setIsAiProcessing(true);
    try {
      const response = await base44.functions.invoke('aiPrioritizeTask', {
        title,
        description
      });
      
      if (response.data.priority) {
        setPriority(response.data.priority);
      }
      if (response.data.suggested_due_date) {
        setDueDate(new Date(response.data.suggested_due_date));
      }
    } catch (error) {
      console.error('AI prioritization failed:', error);
    }
    setIsAiProcessing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    await onUpdate(task.id, { 
      title, 
      description, 
      priority, 
      status,
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
      assigned_to: assignedTo || null
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await onDelete(task.id);
      onClose();
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-100">
            Edit Task
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title" className="text-gray-300">Task Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100"
            />
          </div>
          
          <div>
            <Label htmlFor="edit-description" className="text-gray-300">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100 h-24"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-status" className="text-gray-300">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="todo">To-do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-priority" className="text-gray-300">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-gray-100"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    className="bg-gray-800 text-gray-100"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="edit-assigned" className="text-gray-300">Assign To</Label>
              <Input
                id="edit-assigned"
                type="email"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="user@example.com"
                className="bg-gray-800 border-gray-700 text-gray-100"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleAiPrioritize}
            disabled={!title.trim() || isAiProcessing}
            className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          >
            {isAiProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI is thinking...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                AI Prioritize & Suggest Due Date
              </>
            )}
          </Button>
          
          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-700 text-gray-300"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}