import {Suspense} from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import type { Task } from '../type';

const MyComponent_ = () => {
  const {data} = useSuspenseQuery<Task>({
    queryKey: ['tasks', 1],
    queryFn: () => fetch('http://localhost:3000/tasks/1').then(r => r.json() as Promise<Task>),
  });

  return (<div>{data.title}</div>);
}

export const MyComponent = () => {
  return (
    <ErrorBoundary fallbackRender={() => <div>Error</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <MyComponent_ />
      </Suspense>
    </ErrorBoundary>
  )
}