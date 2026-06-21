import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { RequireAuth } from '@/components/RequireAuth';
import { Login } from '@/pages/Login';
import { Home } from '@/pages/Home';
import { ProcessesIndex } from '@/pages/Processes/Index';
import { ProcessNew } from '@/pages/Processes/New';
import { ProcessDetail } from '@/pages/Processes/Detail';
import { SequencesIndex } from '@/pages/Sequences/Index';
import { SequenceNew } from '@/pages/Sequences/New';
import { SequenceDetail } from '@/pages/Sequences/Detail';
import { PackingList } from '@/pages/Sequences/PackingList';
import { PackingOrder } from '@/pages/Sequences/PackingOrder';
import { SequenceClose } from '@/pages/Sequences/Close';
import { PickingB2 } from '@/pages/PickingB2';
import { PickingB2Day } from '@/pages/PickingB2Day';
import { PickingB2Order } from '@/pages/Sequences/PickingB2Order';
import { Picking } from '@/pages/Picking';
import { Dashboard } from '@/pages/Dashboard';
import { Tracking } from '@/pages/Tracking';
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
              <Route path="processes/:id/picking-b2" element={<PickingB2Day />} />
              <Route path="sequences" element={<SequencesIndex />} />
              <Route path="sequences/new" element={<SequenceNew />} />
              <Route path="sequences/:id" element={<SequenceDetail />} />
              <Route path="sequences/:id/packing" element={<PackingList />} />
              <Route path="sequences/:id/packing/:orderId" element={<PackingOrder />} />
              <Route path="sequences/:id/close" element={<SequenceClose />} />
              <Route path="picking" element={<Picking />} />
              <Route path="picking/b2-day" element={<PickingB2Day />} />
              <Route path="sequences/:id/picking-b2" element={<PickingB2 />} />
              <Route path="sequences/:id/picking-b2/:orderId" element={<PickingB2Order />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tracking" element={<Tracking />} />
              <Route path="debug" element={<Debug />} />
              <Route path="help" element={<Help />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
