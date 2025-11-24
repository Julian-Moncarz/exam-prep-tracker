interface ProgressBarProps {
  progress: number;
  color: string;
}

export function ProgressBar({ progress, color }: ProgressBarProps) {
  return (
    <div className="relative w-full h-8 sketch-progress-container">
      <div
        className="h-full sketch-progress-fill"
        style={{
          width: `${progress}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
