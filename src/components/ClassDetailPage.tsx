import { useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { triggerConfetti } from '../lib/confetti';

interface Note {
  id: string;
  title: string;
  completed: boolean;
}

interface PracticeExam {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface ClassData {
  id: string;
  name: string;
  examDate: string;
  color: string;
  tasks: Task[];
  notes: Note[];
  practiceExams: PracticeExam[];
  notesUrl?: string;
  examsUrl?: string;
}

interface ClassDetailPageProps {
  classData: ClassData;
  onBack: () => void;
  onUpdate: (updatedClass: ClassData) => void;
}

export function ClassDetailPage({ classData, onBack, onUpdate }: ClassDetailPageProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const totalItems = classData.tasks.length + classData.notes.length + classData.practiceExams.length;
  const completedItems =
    classData.tasks.filter((t) => t.completed).length +
    classData.notes.filter((n) => n.completed).length +
    classData.practiceExams.filter((e) => e.completed).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const toggleNote = (noteId: string) => {
    const note = classData.notes.find(n => n.id === noteId);
    // Fire confetti when marking as complete (not when unchecking)
    if (note && !note.completed) {
      triggerConfetti();
    }
    onUpdate({
      ...classData,
      notes: classData.notes.map((note) =>
        note.id === noteId ? { ...note, completed: !note.completed } : note
      ),
    });
  };

  const toggleExam = (examId: string) => {
    const exam = classData.practiceExams.find(e => e.id === examId);
    // Fire confetti when marking as complete (not when unchecking)
    if (exam && !exam.completed) {
      triggerConfetti();
    }
    onUpdate({
      ...classData,
      practiceExams: classData.practiceExams.map((exam) =>
        exam.id === examId ? { ...exam, completed: !exam.completed } : exam
      ),
    });
  };

  const toggleTask = (taskId: string) => {
    const task = classData.tasks.find(t => t.id === taskId);
    // Fire confetti when marking as complete (not when unchecking)
    if (task && !task.completed) {
      triggerConfetti();
    }
    onUpdate({
      ...classData,
      tasks: classData.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    });
  };

  const deleteTask = (taskId: string) => {
    onUpdate({
      ...classData,
      tasks: classData.tasks.filter((task) => task.id !== taskId),
    });
  };

  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
      };
      onUpdate({
        ...classData,
        tasks: [...classData.tasks, newTask],
      });
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    } else if (e.key === 'Escape') {
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFEF7] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-8 sketch-text hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Overview</span>
        </button>

        <div className="mb-8">
          <h1 className="sketch-title" style={{ color: classData.color }}>
            {classData.name}
          </h1>
          <p className="sketch-text opacity-60 text-center">Exam: {classData.examDate}</p>
        </div>

        {/* Progress Overview */}
        <div className="mb-12 sketch-box">
          <div className="flex items-center justify-between mb-4">
            <h2 className="sketch-heading">Overall Progress</h2>
            <span className="sketch-text">{progress}%</span>
          </div>
          <ProgressBar progress={progress} color={classData.color} />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="sketch-text opacity-75 text-center">
              📝 {classData.notes.filter((n) => n.completed).length}/{classData.notes.length} Notes
            </div>
            <div className="sketch-text opacity-75 text-center">
              📄 {classData.practiceExams.filter((e) => e.completed).length}/
              {classData.practiceExams.length} Exams
            </div>
            <div className="sketch-text opacity-75 text-center">
              ✓ {classData.tasks.filter((t) => t.completed).length}/{classData.tasks.length} Tasks
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mb-12 sketch-box">
          {classData.notesUrl ? (
            <a
              href={classData.notesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sketch-heading mb-4 hover:opacity-70 transition-opacity inline-block"
            >
              Learn from Notes →
            </a>
          ) : (
            <h2 className="sketch-heading mb-4">Learn from Notes</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
            {classData.notes.map((note) => (
              <div key={note.id} className="flex items-center gap-3">
                <button
                  onClick={() => toggleNote(note.id)}
                  className="sketch-checkbox"
                  style={{
                    backgroundColor: note.completed ? classData.color : 'transparent',
                  }}
                >
                  {note.completed && (
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
                  className="sketch-text"
                  style={{
                    textDecoration: note.completed ? 'line-through' : 'none',
                    opacity: note.completed ? 0.6 : 1,
                  }}
                >
                  {note.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Practice Exams Section */}
        <div className="mb-12 sketch-box">
          {classData.examsUrl ? (
            <a
              href={classData.examsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sketch-heading mb-4 hover:opacity-70 transition-opacity inline-block"
            >
              Practice Exams →
            </a>
          ) : (
            <h2 className="sketch-heading mb-4">Practice Exams</h2>
          )}
          <div className="space-y-3">
            {classData.practiceExams.map((exam) => (
              <div key={exam.id} className="flex items-center gap-3">
                <button
                  onClick={() => toggleExam(exam.id)}
                  className="sketch-checkbox"
                  style={{
                    backgroundColor: exam.completed ? classData.color : 'transparent',
                  }}
                >
                  {exam.completed && (
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
                  className="sketch-text"
                  style={{
                    textDecoration: exam.completed ? 'line-through' : 'none',
                    opacity: exam.completed ? 0.6 : 1,
                  }}
                >
                  {exam.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Tasks Section */}
        <div className="sketch-box">
          <h2 className="sketch-heading mb-4">Additional Tasks</h2>
          <div className="space-y-3">
            {classData.tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 group">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-1 sketch-checkbox"
                  style={{
                    backgroundColor: task.completed ? classData.color : 'transparent',
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
                <div className="flex-1">
                  <span
                    className="sketch-text"
                    style={{
                      textDecoration: task.completed ? 'line-through' : 'none',
                      opacity: task.completed ? 0.6 : 1,
                    }}
                  >
                    {task.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {isAddingTask ? (
              <div className="flex items-center gap-2">
                <div className="sketch-checkbox mt-1" />
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={addTask}
                  placeholder="Enter task..."
                  className="flex-1 bg-transparent border-b-2 border-black border-dashed outline-none sketch-text"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTask(true)}
                className="flex items-center gap-2 sketch-text opacity-60 hover:opacity-100 transition-opacity"
              >
                <span>+</span>
                <span>Add task</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}