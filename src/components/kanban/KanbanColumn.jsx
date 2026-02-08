import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';

const columnStyles = {
  todo: 'from-blue-500/20 to-cyan-500/10 border-blue-400/40 shadow-blue-500/10',
  in_progress: 'from-purple-500/20 to-pink-500/10 border-purple-400/40 shadow-purple-500/10',
  complete: 'from-emerald-500/20 to-teal-500/10 border-emerald-400/40 shadow-emerald-500/10'
};

const columnIcons = {
  todo: '📋',
  in_progress: '⚡',
  complete: '✨'
};

export default function KanbanColumn({ id, title, children, taskCount }) {
  return (
    <div className="flex-1 min-w-[320px]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{columnIcons[id]}</span>
          <h2 className="text-xl font-bold text-gray-100">{title}</h2>
          <span className="px-2 py-1 text-xs font-semibold bg-gray-700/50 text-gray-300 rounded-full">
            {taskCount}
          </span>
        </div>
      </div>
      
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              min-h-[600px] p-4
              bg-gradient-to-br ${columnStyles[id]}
              border-2 backdrop-blur-sm
              shadow-lg
              transition-all duration-300
              ${snapshot.isDraggingOver ? 'ring-4 ring-purple-400/60 scale-[1.02] shadow-2xl' : ''}
            `}
          >
            {children}
            {provided.placeholder}
          </Card>
        )}
      </Droppable>
    </div>
  );
}