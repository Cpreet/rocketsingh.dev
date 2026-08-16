import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import BusinessCard from './BusinessCard.tsx'

// A hand-rolled, dependency-free path switch — the app only has two pages so
// far. Reach for a router once there's a third or nested/dynamic routes.
const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
const page = pathname === '/card' ? <BusinessCard /> : <App />

createRoot(document.getElementById('root')!).render(<StrictMode>{page}</StrictMode>)
