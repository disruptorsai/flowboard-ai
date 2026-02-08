import React, { useState, useEffect } from 'react';
import { DragDropContext, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import KanbanColumn from '../components/kanban/KanbanColumn';
import TaskCard from '../components/kanban/TaskCard';
import AddTaskModal from '../components/kanban/AddTaskModal';
import TaskDetailModal from '../components/kanban/TaskDetailModal';
import AIChatbot from '../components/kanban/AIChatbot';
import confetti from 'canvas-confetti';

export default function KanbanBoard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const result = await base44.entities.Task.list('-order');
      return result;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const maxOrder = tasks.reduce((max, t) => 
        t.status === taskData.status ? Math.max(max, t.order || 0) : max, 0
      );
      return base44.entities.Task.create({ ...taskData, order: maxOrder + 1 });
    },
    onSuccess: () => queryClient.invalidateQueries(['tasks']),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['tasks']),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['tasks']),
  });

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#10b981', '#14b8a6', '#06b6d4', '#8b5cf6', '#ec4899']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#10b981', '#14b8a6', '#06b6d4', '#8b5cf6', '#ec4899']
      });
    }, 250);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId;
    
    if (newStatus === 'complete' && source.droppableId !== 'complete') {
      triggerConfetti();
    }
    
    const sourceTasks = tasks.filter(t => t.status === source.droppableId);
    const destTasks = tasks.filter(t => t.status === destination.droppableId);
    
    const task = tasks.find(t => t.id === taskId);
    
    if (source.droppableId === destination.droppableId) {
      const reordered = Array.from(sourceTasks);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      
      reordered.forEach((t, idx) => {
        updateTaskMutation.mutate({ id: t.id, data: { order: idx } });
      });
    } else {
      const newSourceTasks = Array.from(sourceTasks);
      newSourceTasks.splice(source.index, 1);
      
      const newDestTasks = Array.from(destTasks);
      newDestTasks.splice(destination.index, 0, task);
      
      await updateTaskMutation.mutateAsync({ 
        id: taskId, 
        data: { status: newStatus, order: destination.index } 
      });
      
      newSourceTasks.forEach((t, idx) => {
        updateTaskMutation.mutate({ id: t.id, data: { order: idx } });
      });
      
      newDestTasks.forEach((t, idx) => {
        if (t.id !== taskId) {
          updateTaskMutation.mutate({ id: t.id, data: { order: idx } });
        }
      });
    }
  };

  const handleTasksUpdate = async (updates) => {
    for (const update of updates) {
      await updateTaskMutation.mutateAsync({ id: update.id, data: update.data });
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'todo').sort((a, b) => (a.order || 0) - (b.order || 0));
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').sort((a, b) => (a.order || 0) - (b.order || 0));
  const completeTasks = tasks.filter(t => t.status === 'complete').sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2 drop-shadow-2xl">
              My Kanban Board
            </h1>
            <p className="text-gray-300 text-lg">Organize your tasks with style ✨</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 shadow-2xl shadow-purple-500/50 text-lg px-6 py-6 hover:scale-105 transition-transform"
          >
            <Plus className="w-6 h-6 mr-2" />
            Add Task
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <KanbanColumn id="todo" title="To-do" taskCount={todoTasks.length}>
              {todoTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TaskCard
                        task={task}
                        onClick={() => setSelectedTask(task)}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
            </KanbanColumn>

            <KanbanColumn id="in_progress" title="In Progress" taskCount={inProgressTasks.length}>
              {inProgressTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TaskCard
                        task={task}
                        onClick={() => setSelectedTask(task)}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
            </KanbanColumn>

            <KanbanColumn id="complete" title="Complete" taskCount={completeTasks.length}>
              {completeTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TaskCard
                        task={task}
                        onClick={() => setSelectedTask(task)}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
            </KanbanColumn>
          </div>
        </DragDropContext>

        <AddTaskModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={(data) => createTaskMutation.mutate(data)}
        />

        <TaskDetailModal
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(id, data) => updateTaskMutation.mutate({ id, data })}
          onDelete={(id) => deleteTaskMutation.mutate(id)}
        />

        <AIChatbot
          tasks={tasks}
          onTasksUpdate={handleTasksUpdate}
        />
      </div>
    </div>
  );
}