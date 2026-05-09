import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { Calendar, Flag, GripVertical } from 'lucide-react';
import TaskModal from './TaskModal';

const PRIORITY_CONFIG = {
  LOW:    { label: 'Low',    color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  MEDIUM: { label: 'Medium', color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20' },
  HIGH:   { label: 'High',   color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20' },
};

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const p = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'DONE';

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group bg-surface-2 border border-border rounded-xl p-3 cursor-pointer
                    hover:border-accent/30 hover:bg-surface-3 transition-all duration-150
                    ${isDragging ? 'shadow-glow' : ''}`}
        onClick={() => setShowModal(true)}
      >
        {/* Drag handle + priority */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div
            {...attributes}
            {...listeners}
            className="mt-0.5 text-gray-700 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={14} />
          </div>
          <p className="text-sm text-white font-medium leading-snug flex-1 line-clamp-2">{task.title}</p>
          <span className={`badge ${p.bg} ${p.color} ${p.border} border flex-shrink-0`}>
            <Flag size={9} />
            {p.label}
          </span>
        </div>

        {task.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2 ml-5">{task.description}</p>
        )}

        {task.deadline && (
          <div className={`flex items-center gap-1.5 ml-5 text-xs ${isOverdue ? 'text-red-400' : 'text-gray-600'}`}>
            <Calendar size={11} />
            {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {isOverdue && <span className="text-red-400 font-medium">· Overdue</span>}
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal task={task} onClose={() => setShowModal(false)} onUpdate={onUpdate} onDelete={onDelete} />
      )}
    </>
  );
}
