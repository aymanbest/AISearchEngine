"use client"

import { useEffect } from "react"
import { ThemeProvider as NextThemeProvider } from "next-themes"

import { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
  [key: string]: string | number | boolean | ReactNode;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    // Load saved preferences from localStorage
    const savedTheme = localStorage.getItem('selectedTheme') || 'zink'
    const savedRadius = localStorage.getItem('radius') || '0.5rem'
    const savedMode = localStorage.getItem('theme') || 'light'

    // Apply saved preferences
    document.documentElement.setAttribute('data-theme', savedTheme)
    document.documentElement.style.setProperty('--radius', savedRadius)
    document.documentElement.classList.toggle('dark', savedMode === 'dark')
  }, [])

  return <NextThemeProvider {...props}>{children}</NextThemeProvider>
}

