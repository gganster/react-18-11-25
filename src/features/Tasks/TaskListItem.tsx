import { useState } from 'react';
import type { Task } from '../../type';
import { TaskForm } from './TaskForm';
import { Modal } from '../../components';

type TaskListItemProps = {
  task: Task;
  onUpdate?: (task: Task) => Promise<void>;
}

export const TaskListItem = ({task, onUpdate}: TaskListItemProps) => {
  const [onEdit, setOnEdit] = useState(false);
  const complete = task.completed;

  const handleUpdateTask = async (task: Task) => {
    if (!onUpdate) return;

    setOnEdit(false);
    await onUpdate(task);
  }

  return (
    <div style={{
      borderWidth: 1,
      borderColor: complete ? "green" : "red",
      borderStyle: "solid",
      padding: 10,
      borderRadius: 10,
      boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
    }}>
      <span>
        {task.title}
      </span>
      <span>
        {complete ? "Completed" : "Not completed"}
      </span>
      {onUpdate ? <button onClick={() => setOnEdit(true)}>Edit</button> : null}
      {onUpdate && onEdit ? 
        <Modal onClose={() => setOnEdit(false)}>
          <TaskForm onSubmit={handleUpdateTask} task={task} /> 
        </Modal>
      : null}
    </div>
  )
}