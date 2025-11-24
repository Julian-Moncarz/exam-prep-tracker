import { ProgressBar } from './ProgressBar';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueToday: boolean;
}

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

interface ClassData {
  id: string;
  name: string;
  examDate: string;
  color: string;
  tasks: Task[];
  notes: Note[];
  practiceExams: PracticeExam[];
}

interface ClassCardProps {
  classData: ClassData;
  progress: number;
  onClassClick: () => void;
}

export function ClassCard({ classData, progress, onClassClick }: ClassCardProps) {
  const completedNotes = classData.notes.filter((n) => n.completed).length;
  const completedExams = classData.practiceExams.filter((e) => e.completed).length;

  return (
    <div className="sketch-box-compact">
      <div className="mb-3 pb-3 border-b-2 border-black border-dashed">
        <button
          onClick={onClassClick}
          className="text-left hover:opacity-70 transition-opacity w-full"
        >
          <h3 className="sketch-class-name-compact mb-1" style={{ color: classData.color }}>
            {classData.name} →
          </h3>
        </button>
        <p className="sketch-text-small opacity-60">Exam: {classData.examDate}</p>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="sketch-text-small">{progress}%</span>
        </div>
        <ProgressBar progress={progress} color={classData.color} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="sketch-text-small opacity-75">
          📝 {completedNotes}/{classData.notes.length}
        </div>
        <div className="sketch-text-small opacity-75">
          📄 {completedExams}/{classData.practiceExams.length}
        </div>
      </div>
    </div>
  );
}