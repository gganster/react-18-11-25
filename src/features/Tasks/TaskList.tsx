import type { Task } from '../../type';
import { TaskListItem } from './TaskListItem';

type TaskListProps = {
  tasks: Task[];
  onUpdate?: (task: Task) => Promise<void>;
}

export const TaskList = ({tasks, onUpdate}: TaskListProps) => {
  if (tasks.length === 0) return <div>No tasks</div>;

  return (
    <div style={{display: "flex", flexDirection: "column", gap: 10}}>
      {tasks.map(i => (
        <TaskListItem key={i.id} task={i} onUpdate={onUpdate} />
      ))}
    </div>
  )
}