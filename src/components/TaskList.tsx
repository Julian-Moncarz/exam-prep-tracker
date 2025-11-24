import { useState } from 'react';
import { X } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onAdd: (text: string) => void;
  color?: string;
}

export function TaskList({ tasks, onToggle, onDelete, onAdd, color }: TaskListProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newTaskText.trim()) {
      onAdd(newTaskText.trim());
      setNewTaskText('');
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      setNewTaskText('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-start gap-3 group">
          <button
            onClick={() => onToggle(task.id)}
            className="mt-1 sketch-checkbox"
            style={{
              backgroundColor: task.completed ? (color || '#4CAF50') : 'transparent',
            }}
          >
            {task.completed && (
              <svg
                width="12"
                height="10"
                viewBox="0 0 12 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5L4.5 8.5L11 1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <span
            className="flex-1 sketch-text"
            style={{
              textDecoration: task.completed ? 'line-through' : 'none',
              opacity: task.completed ? 0.6 : 1,
            }}
          >
            {task.text}
          </span>
          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {isAdding ? (
        <div className="flex items-center gap-2">
          <div className="sketch-checkbox mt-1" />
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleAdd}
            placeholder="Enter task..."
            className="flex-1 bg-transparent border-b-2 border-black border-dashed outline-none sketch-text"
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 sketch-text opacity-60 hover:opacity-100 transition-opacity"
        >
          <span>+</span>
          <span>Add task</span>
        </button>
      )}
    </div>
  );
}
