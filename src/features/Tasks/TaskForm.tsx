import {useState} from 'react';
import type {Task} from '../../type';

type TaskFormProps = {
    task?: Task;
    onSubmit: (task: Task) => Promise<void>;
}

export const TaskForm = ({onSubmit, task}: TaskFormProps) => {
    const [title, setTitle] = useState(task?.title || "");
    const [completed, setCompleted] = useState(task?.completed ?? false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({
       title: ""
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
       e.preventDefault();
       let _error = {title: ""};

       if (title.length < 3) _error = {...error, title: "Title must be at least 3 characters long"};
       setError(_error);

       if (Object.values(_error).filter(i => i !== "").length > 0) return;

       try {
          setIsLoading(true);
          await onSubmit({
             id: task?.id ?? Math.ceil(Math.random() * 1000000),
             userId: task?.userId ?? 1,
             title,
             completed
          } satisfies Task);

          setTitle("");
          setCompleted(false);
          setError({title: ""});

          alert(`Task ${task ? 'updated' : 'added'} successfully`);
       } catch (e: unknown) {
          console.error(e);
          alert("Error adding task");
       }
       setIsLoading(false);
    }

    return (
       <>
          <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: 10}}>
             <input type="text" value={title} onChange={e => setTitle(e.target.value)}/>
             {error.title ? <p style={{color: "red"}}>{error.title}</p> : null}
             <input type="checkbox" checked={completed} onChange={e => setCompleted(e.target.checked)}/>
             <button type="submit" disabled={isLoading}>
                {isLoading ? "Loading..." :
                   task ? 'Update Task' :
                      "Add Task"}
             </button>
          </form>
       </>
    )
}