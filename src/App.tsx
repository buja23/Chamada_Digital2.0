import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';

import { Layout } from '@/components/common/Layout';
import { Login } from '@/pages/Login';
import { Students } from '@/pages/Students';
import { Attendance } from '@/pages/Attendance';
import { InteractiveAttendance } from '@/pages/InteractiveAttendance';
import { History } from '@/pages/History';
import { Register } from '@/pages/Register';
import { NotFound } from '@/pages/NotFound';

// Criar instance do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Rota de Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rotas protegidas com Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/students" replace />} />
              <Route path="students" element={<Students />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="interactive-attendance" element={<InteractiveAttendance />} />
              <Route path="history" element={<History />} />
              <Route path="register" element={<Register />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <Toaster position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;