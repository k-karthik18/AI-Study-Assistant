import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'

// Retrieve the Clerk publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === "your_clerk_publishable_key_here") {
  console.warn("Clerk Publishable Key is missing or placeholder. Running in developer offline mode without login blocker.");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {PUBLISHABLE_KEY && PUBLISHABLE_KEY !== "your_clerk_publishable_key_here" ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
)
