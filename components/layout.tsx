import React from 'react'
import Header from './header'
import { ThemeProvider } from './theme-provider'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

