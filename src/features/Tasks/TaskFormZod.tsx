import {z} from "zod";
import type {Task} from '../../type';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type TaskFormProps = {
  task?: Task;
  onSubmit: (task: Task) => Promise<void>;
}

const taskSchema = z.object({
  userId: z.number().min(1, "User ID must be at least 1"),
  title: z.string().min(3, "3 caractères minimum"),
  completed: z.boolean(),
});
type TaskFormSchema = z.infer<typeof taskSchema>;

export const TaskFormZod = ({onSubmit, task}: TaskFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<TaskFormSchema>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      userId: task?.userId ?? 1,
      title: task?.title ?? "",
      completed: task?.completed ?? false,
    },
  });

  const onSubmitForm = async (data: TaskFormSchema) => {
    try {
      setIsLoading(true);
      await onSubmit({
        id: task?.id ?? Math.ceil(Math.random() * 1000000),
        ...data,
      } satisfies Task);
      if (!task) {
        form.reset();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User ID</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="completed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Completed</FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : task ? "Update Task" : "Add Task"}
        </Button>
      </form>
    </Form>
  )
}