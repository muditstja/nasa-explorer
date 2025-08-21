import React from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './styles/base.css';
import './styles/kpis.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles.css';
import 'leaflet/dist/leaflet.css';

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60_000 } } })

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
