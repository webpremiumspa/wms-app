import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { RequireAuth } from '@/components/RequireAuth';
import { Login } from '@/pages/Login';
import { Home } from '@/pages/Home';
import { Placeholder } from '@/pages/Placeholder';
import { SequencesIndex } from '@/pages/Sequences/Index';
import { SequenceNew } from '@/pages/Sequences/New';
import { SequenceDetail } from '@/pages/Sequences/Detail';
import { SequencePicking } from '@/pages/Sequences/Picking';
import { PackingList } from '@/pages/Sequences/PackingList';
import { PackingOrder } from '@/pages/Sequences/PackingOrder';
import { SequenceClose } from '@/pages/Sequences/Close';
import { PickingB2 } from '@/pages/PickingB2';
import { Dispatch } from '@/pages/Dispatch';
import { Delivery } from '@/pages/Delivery';

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
            <Route
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route index element={<Home />} />
              <Route path="sequences" element={<SequencesIndex />} />
              <Route path="sequences/new" element={<SequenceNew />} />
              <Route path="sequences/:id" element={<SequenceDetail />} />
              <Route path="sequences/:id/picking" element={<SequencePicking />} />
              <Route path="sequences/:id/packing" element={<PackingList />} />
              <Route path="sequences/:id/packing/:orderId" element={<PackingOrder />} />
              <Route path="sequences/:id/close" element={<SequenceClose />} />
              <Route path="picking" element={<Placeholder title="Picking (acceso rápido)" />} />
              <Route path="picking-b2" element={<PickingB2 />} />
              <Route path="dispatch" element={<Dispatch />} />
              <Route path="delivery" element={<Delivery />} />
              <Route path="dashboard" element={<Placeholder title="Supervisión" />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
