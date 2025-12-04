const BASE_URL = 'http://localhost:3000';

const apiClient = async <T>(input: RequestInfo | URL, init?: RequestInit) : Promise<T> => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${BASE_URL}${input}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (!res.ok) {
    console.log('[fetch] error', res);
    throw new Error(`Failed to fetch ${input.toString()}`);
  }

  console.log('[fetch] res', res);

  return (await res.json()) as T;
}

export default apiClient;