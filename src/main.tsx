import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorMonitoringService } from '@/services/errorMonitoring';

// Initialize the enterprise-first error capture system
ErrorMonitoringService.initialize();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

