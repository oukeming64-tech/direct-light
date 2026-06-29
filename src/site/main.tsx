import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ShowcasePage } from './ShowcasePage'
import './showcase.css'

createRoot(document.getElementById('showcase-root')!).render(
  <StrictMode>
    <ShowcasePage />
  </StrictMode>,
)
