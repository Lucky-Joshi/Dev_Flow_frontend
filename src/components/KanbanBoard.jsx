import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import TaskCard from './TaskCard';
import useTaskStore from '../store/taskStore';

const COLUMNS = [
  { id: 'TODO', label: 'Todo', color: 'bg-gray-500' },
  { id: 'DOING', label: 'Doing', color: 'bg-blue-500' },
  { id: 'DONE', label: 'Done', color: 'bg-green-500' },
];

export default function KanbanBoard({ projectId }) {
  const { tasks, updateTask, deleteTask, moveTask } = useTaskStore();
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
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

    moveTask(active.id, targetStatus); // optimistic
    await updateTask(active.id, { status: targetStatus });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-4 h-full">
        {COLUMNS.map((col) => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div key={col.id} className="flex flex-col bg-surface-1 rounded-xl border border-border">
              <div className="flex items-center gap-2 p-4 border-b border-border">
                <span className={`w-2 h-2 rounded-full ${col.color}`} />
                <span className="text-sm font-medium text-white">{col.label}</span>
                <span className="ml-auto text-xs text-gray-500 bg-surface-2 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>
              <SortableContext
                id={col.id}
                items={colTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 p-3 space-y-2 overflow-y-auto min-h-[200px]">
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={updateTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="card opacity-90 rotate-2 shadow-2xl">
            <p className="text-sm text-white font-medium">{activeTask.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
