import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import '@fontsource/rock-3d';
import '@fontsource-variable/roboto';
import '@fontsource/fascinate';
import '@fontsource/lacquer';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
