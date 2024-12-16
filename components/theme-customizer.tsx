import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from 'lucide-react'
import { themes } from "@/lib/themes"
import { useState, useEffect } from 'react'

const radiusOptions = [
  { value: '0', label: '0' },
  { value: '0.3rem', label: '0.3' },
  { value: '0.5rem', label: '0.5' },
  { value: '0.75rem', label: '0.75' },
  { value: '1rem', label: '1.0' }
]

export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [radius, setRadius] = useState('0.5rem')
  const [selectedTheme, setSelectedTheme] = useState('zinc')

  useEffect(() => {
    setMounted(true)
    // Load saved preferences from localStorage
    const savedRadius = localStorage.getItem('radius') || '0.5rem'
    const savedTheme = localStorage.getItem('selectedTheme') || 'zinc'

    // Apply saved preferences
    setRadius(savedRadius)
    setSelectedTheme(savedTheme)

    // Apply theme attributes
    document.documentElement.style.setProperty('--radius', savedRadius)
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme)
      setTheme(localStorage.getItem('theme') || 'light')
    }
  }, [setTheme])

  // Prevent hydration mismatch
  if (!mounted) return null

  const updateTheme = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    // Ensure we keep the color theme when changing light/dark mode
    document.documentElement.setAttribute('data-theme', selectedTheme)
  }

  const updateRadius = (value: string) => {
    setRadius(value)
    localStorage.setItem('radius', value)
    document.documentElement.style.setProperty('--radius', value)
  }

  const updateColorTheme = (themeName: string) => {
    setSelectedTheme(themeName)
    localStorage.setItem('selectedTheme', themeName)
    document.documentElement.setAttribute('data-theme', themeName)
  }

  const themeColors = {
    zinc: 'hsl(240 5.9% 10%)',
    red: 'hsl(0 72.2% 50.6%)',
    rose: 'hsl(346.8 77.2% 49.8%)',
    orange: 'hsl(24.6 95% 53.1%)',
    green: 'hsl(142.1 76.2% 36.3%)',
    blue: 'hsl(221.2 83.2% 53.3%)',
    yellow: 'hsl(47.9 95.8% 53.1%)',
    violet: 'hsl(262.1 83.3% 57.8%)'
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Mode</h3>
        <div className="flex items-center gap-4">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => updateTheme('light')}
          >
            <Sun className="h-5 w-5 mr-2" />
            Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => updateTheme('dark')}
          >
            <Moon className="h-5 w-5 mr-2" />
            Dark
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Radius</h3>
        <div className="flex items-center gap-2">
          {radiusOptions.map((option) => (
            <Button
              key={option.value}
              variant={radius === option.value ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => updateRadius(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Color</h3>
        <div className="grid grid-cols-4 gap-2">
          {Object.values(themes).map((theme) => (
            <Button
            key={theme.name}
            variant={selectedTheme === theme.name ? 'default' : 'outline'}
            className="w-full flex items-center justify-center gap-2"
            onClick={() => updateColorTheme(theme.name)}
          >
            <span
              className="inline-block w-4 h-4 rounded-full border"
              style={{
                backgroundColor: themeColors[theme.name as keyof typeof themeColors],
                boxSizing: 'border-box',
                borderColor: 'var(--border)',
                minWidth: '16px',
                minHeight: '16px'
              }}
            />
            {theme.label}
          </Button>
          ))}
        </div>
      </div>
    </div>
  )
}