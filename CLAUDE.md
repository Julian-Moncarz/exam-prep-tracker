# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Exam Prep Tracker is a React + Vite application for tracking exam preparation progress across multiple classes. The app features a hand-drawn, sketch-like aesthetic using the Caveat font family and custom CSS styling. Users can manage tasks, notes, and practice exams for each class with visual progress tracking.

## Development Commands

- **Install dependencies**: `npm i`
- **Start dev server**: `npm run dev` (opens browser on port 3000)
- **Build for production**: `npm run build` (outputs to `build/` directory)

## Architecture & Key Patterns

### State Management
All application state lives in [App.tsx](src/App.tsx) using React's `useState`. The main data structure is an array of `Class` objects, each containing:
- Basic info (id, name, examDate, color)
- Arrays of tasks, notes, and practiceExams (each with id, title/text, completed status)
- Optional URLs for external notes and exams

State flows down through props, and callbacks flow up to update the parent state.

**Data Persistence**: The app uses localStorage to persist all class data across browser sessions:
- Storage key: `'exam-prep-tracker-data'`
- State is initialized from localStorage via `loadFromLocalStorage()` on app mount
- State is automatically saved to localStorage via `useEffect` whenever it changes
- Default classes data is defined in `DEFAULT_CLASSES` constant and used for first-time users
- Error handling: Silent failures with console.error logging

### Scheduling Algorithm
The app includes a workload-based scheduling system in [App.tsx:54-129](src/App.tsx#L54-L129) (`calculateTodayTasks`) that automatically determines which tasks should be done each day:

- **Weighted workload**: Notes = 1 unit, Practice Exams = 3 units, Tasks = 1 unit
- **Daily calculation**: Divides remaining workload by days until exam (rounded up)
- **Prioritization order**: Notes first, then exams, then tasks
- **Exam date parsing**: Uses `parseExamDate()` to convert "Dec 5" format into Date objects, handling year rollover
- **Scheduling cutoff**: Classes with exams in ≤1 day are skipped (too late to schedule)

The result is displayed in the "Tasks for Today" section on the main view.

### Component Structure
- **App.tsx**: Root component managing all state and routing between list/detail views. Contains scheduling algorithm and progress calculations.
- **ClassCard.tsx**: Displays class summary cards with progress bars on the main view
- **ClassDetailPage.tsx**: Full-page detail view for a single class with all tasks/notes/exams. Supports adding/deleting custom tasks with keyboard shortcuts (Enter to add, Escape to cancel).
- **TaskList.tsx**: Reusable list component for rendering checkable items
- **ProgressBar.tsx**: Simple visual progress indicator with sketch-style diagonal hatch pattern overlay
- **components/ui/**: shadcn/ui component library (see [Attributions.md](src/Attributions.md))
- **components/figma/ImageWithFallback.tsx**: Utility for handling image loading

### Styling Approach
The app uses a custom "sketch" design system with Tailwind CSS:
- Custom sketch classes defined in [src/styles/globals.css](src/styles/globals.css):
  - `sketch-title`, `sketch-heading`, `sketch-text` - Typography with Caveat font
  - `sketch-box`, `sketch-box-compact` - Card containers with hand-drawn borders and shadow
  - `sketch-checkbox` - Custom checkbox with hover animation
  - `sketch-progress-container`, `sketch-progress-fill` - Progress bars with hatch overlay
- **Caveat font family** (Google Fonts) for handwritten aesthetic throughout
- **Inline color styling** using class data colors for personalization
- **Background**: `#FFFEF7` (cream/off-white) for the whole app
- Tailwind utilities alongside custom classes

### Path Alias
The Vite config includes `@` alias pointing to `./src`, allowing imports like `import { Button } from '@/components/ui/button'`

### Data Flow Example
1. User checks a note in ClassDetailPage
2. Component calls `onUpdate` callback with modified classData
3. App.tsx receives update and calls `setClasses` to update state
4. React re-renders affected components with new data

### Progress Calculation
Progress is calculated uniformly across all item types (notes, exams, tasks):
- **Overall "Certainty"**: Total completed items / total items across all classes (displayed on main view)
- **Per-class progress**: Completed items / total items for that class (displayed on class cards and detail pages)
- All items are weighted equally for progress calculation (unlike the scheduling algorithm)

## Component Library

This project uses shadcn/ui (Radix UI + Tailwind) extensively. All UI components are in `src/components/ui/` and can be imported individually. Common components include Button, Card, Dialog, Checkbox, Progress, Tabs, etc.

## External Integrations

Classes can link to external resources via `notesUrl` and `examsUrl` properties. These open in new tabs when clicked in the UI.

## Key Dependencies

- **React 18.3.1** with React DOM
- **Vite 6.3.5** for build tooling and dev server
- **Tailwind CSS** via `@` imports
- **shadcn/ui** component library (Radix UI primitives + Tailwind styling)
- **date-fns** for date manipulation in scheduling algorithm
- **lucide-react** for icons throughout the app

## Data Model Notes

- **Task IDs**: Generated using `Date.now().toString()` for new tasks or pre-defined strings for initial data
- **Exam dates**: Stored as strings in "Mon DD" format (e.g., "Dec 5"), parsed at runtime
- **Colors**: Each class has a hex color used for theming checkboxes, progress bars, and text accents
- **Completion state**: All items (tasks, notes, exams) have a boolean `completed` property

## Deployment

The app is deployed to Vercel with automatic deployments from GitHub:
- **Live URL**: https://exam-prep-tracker.vercel.app (or custom domain if configured)
- **Build command**: `npm run build`
- **Output directory**: `build/`
- **Framework**: Vite (auto-detected by Vercel)
- Pushes to main branch trigger automatic redeployments
