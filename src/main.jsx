import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router/dom";

import AuthProvider from './Contexts/AuthProvider.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './router/Router.jsx';


const queryClient = new QueryClient();  
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <RouterProvider router={router} />
        </div>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
)
