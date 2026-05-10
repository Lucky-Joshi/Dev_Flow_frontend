import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import useTaskStore from '../store/taskStore';

const COLUMNS = [
  { id: 'TODO',   label: 'Backlog',     color: 'bg-gray-500',    glow: 'border-gray-500/20' },
  { id: 'DOING',  label: 'In Progress', color: 'bg-blue-500',    glow: 'border-blue-500/20' },
  { id: 'DONE',   label: 'Done',        color: 'bg-emerald-500', glow: 'border-emerald-500/20' },
];

export default function KanbanBoard({ projectId, onAddTask }) {
  const { tasks, updateTask, deleteTask, moveTask } = useTaskStore();
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const getColumnTasks = (status) => tasks.filter((t) => t.status === status);

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find((t) => t.id === active.id));
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;
    const targetStatus = over.data?.current?.sortable?.containerId || over.id;
    const task = tasks.find((t) => t.id === active.id);
    if (!task || task.status === targetStatus) return;
    moveTask(active.id, targetStatus);
    await updateTask(active.id, { status: targetStatus });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 md:gap-4 h-full pb-4 overflow-x-auto snap-x snap-mandatory">
        {COLUMNS.map((col, ci) => {
          const colTasks = getColumnTasks(col.id);
          return (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.06 }}
              className={`flex flex-col bg-surface-1 rounded-xl border ${col.glow} min-w-[280px] sm:min-w-[300px] flex-1 max-w-sm snap-center`}
            >
              {/* Column header */}
              <div className="flex items-center gap-2.5 px-3 md:px-4 py-3 border-b border-border flex-shrink-0">
                <span className={`w-2 h-2 rounded-full ${col.color}`} />
                <span className="text-sm font-medium text-white truncate">{col.label}</span>
                <span className="ml-auto text-xs text-gray-600 bg-surface-3 px-2 py-0.5 rounded-full tabular-nums flex-shrink-0">
                  {colTasks.length}
                </span>
                {onAddTask && (
                  <button
                    onClick={() => onAddTask(col.id)}
                    className="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:text-white hover:bg-surface-3 transition-colors flex-shrink-0"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>

              {/* Tasks */}
              <SortableContext id={col.id} items={colTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 p-2 md:p-3 space-y-2 overflow-y-auto min-h-[120px]">
                  {colTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onUpdate={updateTask} onDelete={deleteTask} />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="flex items-center justify-center h-20 border border-dashed border-border/50 rounded-lg">
                      <p className="text-xs text-gray-700">Drop tasks here</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </motion.div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="bg-surface-2 border border-accent/40 rounded-xl p-3 shadow-glow rotate-1 w-72">
            <p className="text-sm text-white font-medium">{activeTask.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
