const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/+$/, '');

export const fetchApi = async (path: string, options: RequestInit = {}) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_URL}${cleanPath}`;
  
  options.credentials = 'include';
  
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  options.headers = headers;

  const response = await fetch(url, options);
  
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};
