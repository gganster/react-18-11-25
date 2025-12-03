import { useRef, useState } from 'react';
import type { Task } from '../type';
import { TaskList } from '../features/Tasks/TaskList';
import { Modal } from '../components';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TaskFormZod } from '../features/Tasks/TaskFormZod';
import useTasks from '../hooks/useTasks';

function Home() {
  const {onAdd, count} = useTasks(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    {
      "userId": 1,
      "id": 1,
      "title": "delectus aut autem",
      "completed": false
    },
    {
      "userId": 1,
      "id": 2,
      "title": "quis ut nam facilis et officia qui",
      "completed": false
    },
    {
      "userId": 1,
      "id": 3,
      "title": "fugiat veniam minus",
      "completed": false
    },
    {
      "userId": 1,
      "id": 4,
      "title": "et porro tempora",
      "completed": true
    },
    {
      "userId": 1,
      "id": 5,
      "title": "laboriosam mollitia et enim quasi adipisci quia provident illum",
      "completed": false
    },
    {
      "userId": 1,
      "id": 6,
      "title": "qui ullam ratione quibusdam voluptatem quia omnis",
      "completed": false
    },
    {
      "userId": 1,
      "id": 7,
      "title": "illo expedita consequatur quia in",
      "completed": false
    },
    {
      "userId": 1,
      "id": 8,
      "title": "quo adipisci enim quam ut ab",
      "completed": true
    },
    {
      "userId": 1,
      "id": 9,
      "title": "molestiae perspiciatis ipsa",
      "completed": false
    },
    {
      "userId": 1,
      "id": 10,
      "title": "illo est ratione doloremque quia maiores aut",
      "completed": true
    },
  ]);

  const handleAddTask = async (task: Task): Promise<void> => {
    setTasks(prev => [...prev, task]);
  }

  const handleUpdateTask = async (task: Task): Promise<void> => {
    setTasks(prev => prev.map(i => i.id === task.id ? task : i));
  }

  return (
    <>
      <Button onClick={onAdd}>Click me {count}</Button>
      <Link to="/about">About</Link>
      <Button onClick={() => setIsModalOpen(true)}>Add Task</Button>
      <TaskList tasks={tasks} onUpdate={handleUpdateTask} />


      {isModalOpen ? 
        <Modal onClose={() => setIsModalOpen(false)}>
          <TaskFormZod onSubmit={handleAddTask} />
        </Modal>
      : null}
    </>
  )
}

export default Home