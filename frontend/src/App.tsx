import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { RequireAuth } from '@/components/RequireAuth';
import { Login } from '@/pages/Login';
import { Home } from '@/pages/Home';
import { ProcessesIndex } from '@/pages/Processes/Index';
import { ProcessNew } from '@/pages/Processes/New';
import { ProcessDetail } from '@/pages/Processes/Detail';
import { SequenceNew } from '@/pages/Sequences/New';
import { SequenceDetail } from '@/pages/Sequences/Detail';
import { PackingList } from '@/pages/Sequences/PackingList';
import { PackingOrder } from '@/pages/Sequences/PackingOrder';
import { SequenceClose } from '@/pages/Sequences/Close';
import { PickingB1Day } from '@/pages/PickingB1Day';
import { PickingB2Day } from '@/pages/PickingB2Day';
import { PickingB2Order } from '@/pages/Sequences/PickingB2Order';
import { PickingB2GlobalRedirect, SequenceB2Redirect } from '@/pages/Redirects';
import { Dashboard } from '@/pages/Dashboard';
import { Tracking } from '@/pages/Tracking';
import { Returned } from '@/pages/Returned';
import { Help } from '@/pages/Help';
import { Debug } from '@/pages/Debug';
import { Scan } from '@/pages/Scan';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/scan/:wpOrderId" element={<Scan />} />
            <Route
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route index element={<Home />} />
              <Route path="processes" element={<ProcessesIndex />} />
              <Route path="processes/new" element={<ProcessNew />} />
              <Route path="processes/:id" element={<ProcessDetail />} />
              <Route path="processes/:id/picking-b1" element={<PickingB1Day />} />
              <Route path="processes/:id/picking-b2" element={<PickingB2Day />} />
              <Route path="sequences/new" element={<SequenceNew />} />
              <Route path="sequences/:id" element={<SequenceDetail />} />
              <Route path="sequences/:id/packing" element={<PackingList />} />
              <Route path="sequences/:id/packing/:orderId" element={<PackingOrder />} />
              <Route path="sequences/:id/close" element={<SequenceClose />} />
              <Route path="sequences/:id/picking-b2/:orderId" element={<PickingB2Order />} />

              {/* Redirects de rutas viejas tras Fase B (Procesos como top-level).
                  Mantienen funcionando bookmarks y links de albaranes viejos. */}
              <Route path="sequences" element={<Navigate to="/processes" replace />} />
              <Route path="picking" element={<Navigate to="/processes" replace />} />
              <Route path="picking/b2-day" element={<PickingB2GlobalRedirect />} />
              <Route path="sequences/:id/picking-b2" element={<SequenceB2Redirect />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tracking" element={<Tracking />} />
              <Route path="returned" element={<Returned />} />
              <Route path="debug" element={<Debug />} />
              <Route path="help" element={<Help />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
