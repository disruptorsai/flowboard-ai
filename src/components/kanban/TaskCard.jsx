import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flag, Clock } from 'lucide-react';
import { format } from 'date-fns';

const priorityColors = {
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function TaskCard({ task, onClick, isDragging }) {
  return (
    <Card
      onClick={onClick}
      className={`
        p-4 mb-3 cursor-pointer
        bg-gradient-to-br from-gray-800/90 to-gray-900/90
        border border-gray-700/50 hover:border-purple-500/50
        transition-all duration-300 ease-out
        hover:shadow-lg hover:shadow-purple-500/20
        hover:scale-[1.02]
        ${isDragging ? 'opacity-50 rotate-2' : ''}
      `}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-100 leading-tight flex-1">
            {task.title}
          </h3>
          {task.priority && (
            <Badge className={`${priorityColors[task.priority]} border text-xs`}>
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </Badge>
          )}
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-400 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{format(new Date(task.created_date), 'MMM d, yyyy')}</span>
        </div>
      </div>
    </Card>
  );
}