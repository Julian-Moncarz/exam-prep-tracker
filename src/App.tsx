import { useState, useMemo, useEffect } from 'react';
import { ClassCard } from './components/ClassCard';
import { TaskList } from './components/TaskList';
import { ProgressBar } from './components/ProgressBar';
import { ClassDetailPage } from './components/ClassDetailPage';
import { ArrowLeft } from 'lucide-react';
import { parseISO, differenceInDays, startOfDay } from 'date-fns';
import { triggerConfetti } from './lib/confetti';

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

interface Class {
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

// localStorage keys for persisting app data
const STORAGE_KEY = 'exam-prep-tracker-data';
const SNAPSHOT_STORAGE_KEY = 'exam-prep-tracker-today-snapshot';

// Default classes data (used when no saved data exists)
const DEFAULT_CLASSES: Class[] = [
  {
    id: '1',
    name: 'ESC101H1',
    examDate: 'Dec 5',
    color: '#E57373',
    notesUrl: 'https://q.utoronto.ca/courses/411081/modules',
    examsUrl: 'https://courses.skule.ca/course/ESC101H1#63',
    tasks: [
      { id: 'c1-1', text: 'Review lecture summaries', completed: false },
      { id: 'c1-2', text: 'Practice old exam problems', completed: false },
    ],
    notes: Array.from({ length: 35 }, (_, i) => ({
      id: `c1-n${i + 1}`,
      title: `Lecture ${i + 1}`,
      completed: false,
    })),
    practiceExams: [
      { id: 'c1-e1', title: 'Practice Exam 1', completed: false },
      { id: 'c1-e2', title: 'Practice Exam 2', completed: false },
      { id: 'c1-e3', title: 'Practice Exam 3', completed: false },
    ],
  },
  {
    id: '2',
    name: 'PHY180H1',
    examDate: 'Dec 8',
    color: '#64B5F6',
    notesUrl: 'https://q.utoronto.ca/courses/411727/modules',
    examsUrl: 'https://courses.skule.ca/api/exam/exams/bulk/20229/PHY180F_2022_FOUNDATIONS%20OF%20PHYSICS_E.pdf',
    tasks: [
      { id: 'c2-1', text: 'Review key formulas', completed: false },
      { id: 'c2-2', text: 'Work through example problems', completed: false },
    ],
    notes: Array.from({ length: 40 }, (_, i) => ({
      id: `c2-n${i + 1}`,
      title: `Class ${i + 1}`,
      completed: false,
    })),
    practiceExams: [
      { id: 'c2-e1', title: 'Practice Exam 1', completed: false },
      { id: 'c2-e2', title: 'Practice Exam 2', completed: false },
    ],
  },
  {
    id: '3',
    name: 'ESC103H1',
    examDate: 'Dec 10',
    color: '#FFD54F',
    notesUrl: 'https://utoronto-my.sharepoint.com/personal/arthurwh_chan_utoronto_ca/_layouts/15/Doc.aspx?sourcedoc={0233b3bd-a7a3-47af-93e1-b7aaee161dc4}&action=view&wd=target%28_Content%20Library%2FLecture%20Notes.one%7C56c400db-6a6c-4795-aaa6-d446a4dec196%2FUnit%201%20Review%20of%20vectors%7Cf88f82fa-7b2f-4c6a-828d-1654b414a48e%2F%29&wdorigin=NavigationUrl',
    examsUrl: 'https://courses.skule.ca/course/ESC103H1#63',
    tasks: [
      { id: 'c3-1', text: 'Review vector operations', completed: false },
      { id: 'c3-2', text: 'Practice unit conversions', completed: false },
    ],
    notes: Array.from({ length: 25 }, (_, i) => ({
      id: `c3-n${i + 1}`,
      title: `Unit ${i + 1}`,
      completed: false,
    })),
    practiceExams: [
      { id: 'c3-e1', title: 'Practice Exam 1', completed: false },
      { id: 'c3-e2', title: 'Practice Exam 2', completed: false },
      { id: 'c3-e3', title: 'Practice Exam 3', completed: false },
      { id: 'c3-e4', title: 'Practice Exam 4', completed: false },
    ],
  },
  {
    id: '4',
    name: 'ESC194H1',
    examDate: 'Dec 12',
    color: '#BA68C8',
    examsUrl: 'https://courses.skule.ca/course/MAT194H1#63',
    tasks: [
      { id: 'c4-1', text: 'Finish remaining problem sets', completed: false },
      { id: 'c4-2', text: 'Review derivatives and integrals', completed: false },
    ],
    notes: [
      { id: 'c4-n1', title: 'Stewart 1.4 + Appendix D (Trig)', completed: false },
      { id: 'c4-n2', title: 'Barbeau-Stangeby Supplement 1, 2.1-2.7', completed: false },
      { id: 'c4-n3', title: 'Stewart 1.5 + Problems 1.1-1.3', completed: false },
      { id: 'c4-n4', title: 'Stewart 1.6-1.8 + Supplement 2.8, 3.1-3.4, 4.1', completed: false },
      { id: 'c4-n5', title: 'Stewart 2.1-2.7 (Limits)', completed: false },
      { id: 'c4-n6', title: 'Stewart 2.8-2.9 + Supplement 4.2-4.3', completed: false },
      { id: 'c4-n7', title: 'Stewart 3.1-3.4 (Derivatives)', completed: false },
      { id: 'c4-n8', title: 'Stewart 3.5, 3.7, 3.9, 4.1 + Appendix E', completed: false },
      { id: 'c4-n9', title: 'Stewart 4.2-4.3 (Applications)', completed: false },
      { id: 'c4-n10', title: 'Stewart 4.4-4.5, 5.1-5.2 (Optimization & Integrals)', completed: false },
      { id: 'c4-n11', title: 'Stewart 5.3, 5.5, 6.1, 6.2* (Integration)', completed: false },
      { id: 'c4-n12', title: 'Stewart 6.3*-6.4* (Applications of Integration)', completed: false },
      { id: 'c4-n13', title: 'Stewart 6.6 (Inverse Functions)', completed: false },
      { id: 'c4-n14', title: 'Stewart 6.8, 9.1, 9.3, 6.5, 9.4 (Differential Equations)', completed: false },
      { id: 'c4-n15', title: 'Stewart 9.5, 17.1 + Complex Numbers', completed: false },
      { id: 'c4-n16', title: 'Stewart 17.2 (Vector Calculus)', completed: false },
    ],
    practiceExams: Array.from({ length: 10 }, (_, i) => ({
      id: `c4-e${i + 1}`,
      title: `Practice Exam ${i + 1}`,
      completed: false,
    })),
  },
  {
    id: '5',
    name: 'ESC180H1',
    examDate: 'Dec 16',
    color: '#4DB6AC',
    examsUrl: 'https://www.cs.toronto.edu/~guerzhoy/180/',
    tasks: [
      { id: 'c5-1', text: 'Review Python syntax and concepts', completed: false },
      { id: 'c5-2', text: 'Practice coding problems', completed: false },
      { id: 'c5-3', text: 'Review data structures', completed: false },
    ],
    notes: [],
    practiceExams: Array.from({ length: 6 }, (_, i) => ({
      id: `c5-e${i + 1}`,
      title: `Practice Exam ${i + 1}`,
      completed: false,
    })),
  },
  {
    id: '6',
    name: 'CIV102H1',
    examDate: 'Dec 19',
    color: '#FF8A65',
    notesUrl: 'https://courses.skule.ca/course/CIV102H1#66',
    examsUrl: 'https://courses.skule.ca/course/CIV102H1#63',
    tasks: [
      { id: 'c6-1', text: 'Review structural analysis methods', completed: false },
      { id: 'c6-2', text: 'Practice bridge design calculations', completed: false },
    ],
    notes: Array.from({ length: 35 }, (_, i) => ({
      id: `c6-n${i + 1}`,
      title: `Lecture ${i + 1}`,
      completed: false,
    })),
    practiceExams: Array.from({ length: 10 }, (_, i) => ({
      id: `c6-e${i + 1}`,
      title: `Practice Exam ${i + 1}`,
      completed: false,
    })),
  },
];

// Load classes from localStorage, or return defaults if none exist
function loadFromLocalStorage(): Class[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
  }
  return DEFAULT_CLASSES;
}

// Save classes to localStorage
function saveToLocalStorage(classes: Class[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
}

// Interface for the daily snapshot stored in localStorage
interface DailySnapshot {
  date: string;
  tasks: any[];
  completedIds: string[];
}

// Load today's snapshot from localStorage
function loadSnapshotFromLocalStorage(): DailySnapshot | null {
  try {
    const saved = localStorage.getItem(SNAPSHOT_STORAGE_KEY);
    if (saved) {
      const snapshot = JSON.parse(saved) as DailySnapshot;
      const today = startOfDay(new Date()).toISOString();

      // Only return the snapshot if it's for today
      if (snapshot.date === today) {
        return snapshot;
      }
    }
  } catch (error) {
    console.error('Failed to load snapshot from localStorage:', error);
  }
  return null;
}

// Save today's snapshot to localStorage
function saveSnapshotToLocalStorage(snapshot: DailySnapshot): void {
  try {
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.error('Failed to save snapshot to localStorage:', error);
  }
}

// Helper to parse exam date strings like "Dec 5" into Date objects
function parseExamDate(dateStr: string): Date {
  const currentYear = new Date().getFullYear();
  // Assuming dates are in format "Mon DD" like "Dec 5"
  const date = new Date(`${dateStr}, ${currentYear}`);

  // If the parsed date is in the past, assume it's for next year
  if (date < new Date()) {
    date.setFullYear(currentYear + 1);
  }

  return date;
}

// Scheduling algorithm: calculates which tasks should be done today
function calculateTodayTasks(classes: Class[]): Array<Task & { classId: string; className: string; color: string; type: 'task' | 'note' | 'exam'; itemTitle?: string; notesUrl?: string; examsUrl?: string }> {
  const today = startOfDay(new Date());
  const scheduledTasks: Array<Task & { classId: string; className: string; color: string; type: 'task' | 'note' | 'exam'; itemTitle?: string; notesUrl?: string; examsUrl?: string }> = [];

  classes.forEach((cls) => {
    const examDate = parseExamDate(cls.examDate);
    const daysUntilExam = differenceInDays(examDate, today);

    // Filter out past-due exams
    if (daysUntilExam < 0) {
      return;
    }

    // If exam is today or tomorrow, skip scheduling (too late!)
    if (daysUntilExam <= 1) {
      return;
    }

    // Calculate remaining workload (notes = 1, exams = 3)
    const uncompletedNotes = cls.notes.filter(n => !n.completed);
    const uncompletedExams = cls.practiceExams.filter(e => !e.completed);
    const uncompletedTasks = cls.tasks.filter(t => !t.completed);

    const totalWorkload =
      uncompletedNotes.length * 1 +
      uncompletedExams.length * 3 +
      uncompletedTasks.length * 1;

    if (totalWorkload === 0) {
      return; // nothing to do for this class
    }

    // Calculate daily workload and round up
    const dailyWorkload = totalWorkload / daysUntilExam;
    const tasksToScheduleToday = Math.ceil(dailyWorkload);

    // Collect items in order: notes first (earlier to later), then exams, then tasks
    // Notes should be done before exams as per requirements
    const itemsInOrder: Array<{ item: Task | Note | PracticeExam; type: 'task' | 'note' | 'exam'; weight: number }> = [];

    uncompletedNotes.forEach(note => {
      itemsInOrder.push({ item: note, type: 'note', weight: 1 });
    });

    uncompletedExams.forEach(exam => {
      itemsInOrder.push({ item: exam, type: 'exam', weight: 3 });
    });

    uncompletedTasks.forEach(task => {
      itemsInOrder.push({ item: task, type: 'task', weight: 1 });
    });

    // Select first N items based on cumulative weight
    let remainingWorkload = tasksToScheduleToday;
    for (const { item, type, weight } of itemsInOrder) {
      if (remainingWorkload <= 0) break;

      // Convert Note or PracticeExam to Task format for display
      const taskItem: Task & { classId: string; className: string; color: string; type: 'task' | 'note' | 'exam'; itemTitle?: string; notesUrl?: string; examsUrl?: string } = {
        id: item.id,
        text: type === 'task' ? (item as Task).text : item.title,
        completed: item.completed,
        classId: cls.id,
        className: cls.name,
        color: cls.color,
        type: type,
        itemTitle: type !== 'task' ? item.title : undefined,
        notesUrl: cls.notesUrl,
        examsUrl: cls.examsUrl,
      };

      scheduledTasks.push(taskItem);
      remainingWorkload -= weight;
    }
  });

  return scheduledTasks;
}

export default function App() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classes, setClasses] = useState<Class[]>(loadFromLocalStorage);
  const [celebratingTaskId, setCelebratingTaskId] = useState<string | null>(null);

  // Auto-save to localStorage whenever classes state changes
  useEffect(() => {
    saveToLocalStorage(classes);
  }, [classes]);

  // Calculate certainty based on all completed items
  const certainty = useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;

    classes.forEach((cls) => {
      // Count tasks
      totalItems += cls.tasks.length;
      completedItems += cls.tasks.filter((t) => t.completed).length;

      // Count notes
      totalItems += cls.notes.length;
      completedItems += cls.notes.filter((n) => n.completed).length;

      // Count practice exams
      totalItems += cls.practiceExams.length;
      completedItems += cls.practiceExams.filter((e) => e.completed).length;
    });

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }, [classes]);

  // Get today's tasks using the weighted workload scheduling algorithm
  // Snapshot approach: lock in the tasks at the start of each day and persist to localStorage
  const [todayTasksSnapshot, setTodayTasksSnapshot] = useState<{
    date: string;
    tasks: any[];
  }>(() => {
    const today = startOfDay(new Date()).toISOString();
    const savedSnapshot = loadSnapshotFromLocalStorage();

    if (savedSnapshot && savedSnapshot.date === today) {
      // Restore from localStorage if it's for today
      return {
        date: savedSnapshot.date,
        tasks: savedSnapshot.tasks
      };
    } else {
      // Calculate fresh tasks for today
      return {
        date: today,
        tasks: calculateTodayTasks(classes)
      };
    }
  });

  // Track completed tasks for today (persists across reloads)
  const [completedToday, setCompletedToday] = useState<Array<Task & { classId: string; className: string; color: string; type: 'task' | 'note' | 'exam'; itemTitle?: string; notesUrl?: string; examsUrl?: string }>>([]);

  // Restore completedToday from localStorage on mount
  useEffect(() => {
    const savedSnapshot = loadSnapshotFromLocalStorage();
    const today = startOfDay(new Date()).toISOString();

    if (savedSnapshot && savedSnapshot.date === today && savedSnapshot.completedIds.length > 0) {
      // Reconstruct completedToday array from saved IDs
      const completedIds = new Set(savedSnapshot.completedIds);
      const restoredCompleted = todayTasksSnapshot.tasks.filter((task: any) => completedIds.has(task.id));
      setCompletedToday(restoredCompleted);
    }
  }, []); // Only run once on mount

  // Save snapshot to localStorage whenever todayTasksSnapshot or completedToday changes
  useEffect(() => {
    const snapshot: DailySnapshot = {
      date: todayTasksSnapshot.date,
      tasks: todayTasksSnapshot.tasks,
      completedIds: completedToday.map((task: any) => task.id)
    };
    saveSnapshotToLocalStorage(snapshot);
  }, [todayTasksSnapshot, completedToday]);

  // Recalculate todayTasks only when the date changes, not when tasks are completed
  useEffect(() => {
    const today = startOfDay(new Date()).toISOString();
    if (todayTasksSnapshot.date !== today) {
      // New day - recalculate tasks and clear completedToday
      setTodayTasksSnapshot({
        date: today,
        tasks: calculateTodayTasks(classes)
      });
      setCompletedToday([]);
    }
  }, [classes, todayTasksSnapshot.date]);

  // Sync completion status from classes to the snapshot
  // This keeps the checked/unchecked state in sync without recalculating the list
  const todayTasks = useMemo(() => {
    return todayTasksSnapshot.tasks.map((snapshotTask: any) => {
      // Find the current class
      const cls = classes.find((c: Class) => c.id === snapshotTask.classId);
      if (!cls) return snapshotTask;

      // Find the actual item in the class data to get its current completion status
      let actualItem;
      if (snapshotTask.type === 'note') {
        actualItem = cls.notes.find((n: Note) => n.id === snapshotTask.id);
      } else if (snapshotTask.type === 'exam') {
        actualItem = cls.practiceExams.find((e: PracticeExam) => e.id === snapshotTask.id);
      } else {
        actualItem = cls.tasks.find((t: Task) => t.id === snapshotTask.id);
      }

      // Return snapshot task with updated completion status
      return actualItem ? { ...snapshotTask, completed: actualItem.completed } : snapshotTask;
    });
  }, [todayTasksSnapshot.tasks, classes]);

  // Calculate progress for each class
  const getClassProgress = (cls: Class) => {
    const totalItems = cls.tasks.length + cls.notes.length + cls.practiceExams.length;
    const completedItems =
      cls.tasks.filter((t) => t.completed).length +
      cls.notes.filter((n) => n.completed).length +
      cls.practiceExams.filter((e) => e.completed).length;
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const toggleTodayTask = (taskId: string) => {
    // Find the task in todayTasks before toggling - we need this info to move it to completed
    const taskBeingToggled = todayTasks.find(t => t.id === taskId);

    // If marking as complete, trigger celebration animation - woohoo!
    if (taskBeingToggled && !taskBeingToggled.completed) {
      setCelebratingTaskId(taskId);
      setTimeout(() => setCelebratingTaskId(null), 400); // matches animation duration
      triggerConfetti(); // party time!
    }

    // Update the underlying class data
    setClasses((prevClasses) =>
      prevClasses.map((cls) => ({
        ...cls,
        tasks: cls.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
        notes: cls.notes.map((note) =>
          note.id === taskId ? { ...note, completed: !note.completed } : note
        ),
        practiceExams: cls.practiceExams.map((exam) =>
          exam.id === taskId ? { ...exam, completed: !exam.completed } : exam
        ),
      }))
    );

    // Handle adding/removing from completedToday
    if (taskBeingToggled) {
      if (!taskBeingToggled.completed) {
        // Task is being marked complete - add to completedToday
        setCompletedToday(prev => [...prev, taskBeingToggled]);
      } else {
        // Task is being unmarked - remove from completedToday
        setCompletedToday(prev => prev.filter(t => t.id !== taskId));
      }
    }
  };

  const updateClass = (updatedClass: Class) => {
    setClasses((prevClasses) =>
      prevClasses.map((cls) => (cls.id === updatedClass.id ? updatedClass : cls))
    );
  };

  const selectedClass = classes.find((cls) => cls.id === selectedClassId);

  if (selectedClass) {
    return (
      <ClassDetailPage
        classData={selectedClass}
        onBack={() => setSelectedClassId(null)}
        onUpdate={updateClass}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFEF7] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h1 className="text-center mb-12 sketch-title">Exam Prep Tracker</h1>

        {/* Certainty Section */}
        <div className="mb-12 sketch-box">
          <div className="flex items-center justify-between mb-4">
            <h2 className="sketch-heading">Certainty</h2>
            <span className="sketch-text">{certainty}%</span>
          </div>
          <ProgressBar progress={certainty} color="#4CAF50" />
        </div>

        {/* Tasks for Today */}
        <div className="mb-12 sketch-box">
          <h2 className="sketch-heading mb-4">Tasks for Today</h2>

          {/* Rainbow Progress Bar */}
          {todayTasks.length > 0 && (
            <div className="mb-6">
              <div className="sketch-progress-container h-8 mb-2">
                <div
                  className="sketch-progress-fill h-full flex items-center justify-center"
                  style={{
                    width: `${completedToday.length > 0 ? (completedToday.length / todayTasks.length) * 100 : 0}%`,
                    background: 'linear-gradient(90deg, hsl(0, 70%, 60%) 0%, hsl(30, 70%, 60%) 20%, hsl(60, 70%, 60%) 35%, hsl(120, 70%, 60%) 50%, hsl(180, 70%, 60%) 65%, hsl(240, 70%, 60%) 80%, hsl(280, 70%, 60%) 90%, hsl(320, 70%, 60%) 100%)',
                    transition: 'width 0.5s ease'
                  }}
                >
                  {completedToday.length > 0 && (
                    <span className="sketch-text-small font-bold text-white relative z-10">
                      {completedToday.length}/{todayTasks.length}
                    </span>
                  )}
                </div>
              </div>
              <p className="sketch-text-small text-center opacity-75">
                {completedToday.length} of {todayTasks.length} tasks completed
              </p>
            </div>
          )}

          {/* Active Tasks */}
          {todayTasks.length === 0 && completedToday.length === 0 ? (
            <p className="sketch-text opacity-60">No tasks due today! 🎉</p>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 task-fade-in">
                  <button
                    onClick={() => toggleTodayTask(task.id)}
                    className={`mt-1 sketch-checkbox ${celebratingTaskId === task.id ? 'celebrating' : ''}`}
                    style={{
                      backgroundColor: task.completed ? '#4CAF50' : 'transparent',
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
                    {/* Task name - clickable if it's a note or exam with a URL */}
                    {task.type === 'note' && task.notesUrl ? (
                      <a
                        href={task.notesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sketch-text cursor-pointer"
                        style={{
                          textDecoration: task.completed ? 'line-through' : 'none',
                          opacity: task.completed ? 0.6 : 1,
                        }}
                      >
                        {task.text}
                      </a>
                    ) : task.type === 'exam' && task.examsUrl ? (
                      <a
                        href={task.examsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sketch-text cursor-pointer"
                        style={{
                          textDecoration: task.completed ? 'line-through' : 'none',
                          opacity: task.completed ? 0.6 : 1,
                        }}
                      >
                        {task.text}
                      </a>
                    ) : (
                      <span
                        className="sketch-text"
                        style={{
                          textDecoration: task.completed ? 'line-through' : 'none',
                          opacity: task.completed ? 0.6 : 1,
                        }}
                      >
                        {task.text}
                      </span>
                    )}
                    {/* Class name - always clickable, navigates to class detail page */}
                    <button
                      onClick={() => setSelectedClassId(task.classId)}
                      className="sketch-text ml-2 opacity-75 cursor-pointer"
                      style={{ color: task.color }}
                    >
                      • {task.className}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Classes */}
        <div className="grid grid-cols-2 gap-4">
          {classes.map((cls) => (
            <ClassCard
              key={cls.id}
              classData={cls}
              progress={getClassProgress(cls)}
              onClassClick={() => setSelectedClassId(cls.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}