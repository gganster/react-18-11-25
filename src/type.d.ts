export type Task = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export type User = {
  id: number;
  email: string;
  password: string;
}