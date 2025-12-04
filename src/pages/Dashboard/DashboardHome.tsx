import useAuthStore from "@/stores/auth"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { Task } from "@/type";

function DashboardHome() {
  const {user} = useAuthStore();
  const {data} = useSuspenseQuery<Task[]>({queryKey: [`/tasks/${user?.id}`]});

  return (
    <>
      <h1>Tasks</h1>
      <ul>
        {data.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
     </ul>
    </>
  )
}

export default DashboardHome