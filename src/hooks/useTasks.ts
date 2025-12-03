import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const useTasks = (id: number) => {
  const {data, isLoading, error} = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => fetch(`http://localhost:3000/tasks/${id}`).then(res => res.json()),
  });

  return {onAdd, count};
}

export default useTasks;