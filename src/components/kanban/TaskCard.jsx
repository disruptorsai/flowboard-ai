import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flag, Clock, Calendar, User, AlertCircle } from 'lucide-react';
import { format, isAfter, isBefore, differenceInDays, startOfDay } from 'date-fns';

const priorityColors = {
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function TaskCard({ task, onClick, isDragging }) {
  const getDueDateStatus = () => {
    if (!task.due_date) return null;
    
    const today = startOfDay(new Date());
    const dueDate = startOfDay(new Date(task.due_date));
    const daysUntil = differenceInDays(dueDate, today);
    
    if (daysUntil < 0) {
      return { status: 'overdue', label: 'Overdue', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    } else if (daysUntil === 0) {
      return { status: 'today', label: 'Due Today', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    } else if (daysUntil <= 3) {
      return { status: 'upcoming', label: `${daysUntil}d left`, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    }
    return null;
  };

  const dueDateStatus = getDueDateStatus();

  const isComplete = task.status === 'complete';

  return (
    <Card
      onClick={onClick}
      className={`
        p-4 mb-3 cursor-pointer
        ${isComplete 
          ? 'bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-cyan-900/40 border-emerald-400/30' 
          : 'bg-gradient-to-br from-gray-800/95 via-gray-850/90 to-gray-900/95 border-gray-600/40'
        }
        border-2 hover:border-purple-400/60
        transition-all duration-300 ease-out
        hover:shadow-xl hover:shadow-purple-500/30
        hover:scale-[1.03]
        backdrop-blur-sm
        ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''}
        ${dueDateStatus?.status === 'overdue' ? 'ring-2 ring-red-500/50 shadow-red-500/20' : ''}
        ${isComplete ? 'opacity-75' : ''}
      `}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-semibold leading-tight flex-1 ${isComplete ? 'line-through text-emerald-300/70' : 'text-gray-100'}`}>
            {task.title}
          </h3>
          <div className="flex flex-wrap gap-1 justify-end">
            {task.priority && (
              <Badge className={`${priorityColors[task.priority]} border text-xs`}>
                <Flag className="w-3 h-3 mr-1" />
                {task.priority}
              </Badge>
            )}
            {dueDateStatus && (
              <Badge className={`${dueDateStatus.color} border text-xs`}>
                <AlertCircle className="w-3 h-3 mr-1" />
                {dueDateStatus.label}
              </Badge>
            )}
          </div>
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-400 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(task.due_date), 'MMM d')}</span>
              </div>
            )}
            {task.assigned_to && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{task.assigned_to.split('@')[0]}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{format(new Date(task.created_date), 'MMM d')}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}