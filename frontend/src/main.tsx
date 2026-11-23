import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './auth/AuthProvider';
import { AvisoServidor } from './componentes/AvisoServidor';
import './estilos.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <AvisoServidor />
    </AuthProvider>
  </StrictMode>,
);
