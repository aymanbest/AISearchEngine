import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Monitor } from 'lucide-react'
import { themes } from "@/lib/themes"
import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"

const radiusOptions = [
  { value: '0', label: 'Square' },
  { value: '0.3rem', label: 'Small' },
  { value: '0.5rem', label: 'Medium' },
  { value: '0.75rem', label: 'Large' },
  { value: '1rem', label: 'Full' }
]

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
}

export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [radius, setRadius] = useState('0.5rem')
  const [selectedTheme, setSelectedTheme] = useState('zinc')

  useEffect(() => {
    setMounted(true)
    const savedRadius = localStorage.getItem('radius') || '0.5rem'
    const savedTheme = localStorage.getItem('selectedTheme') || 'zinc'
    setRadius(savedRadius)
    setSelectedTheme(savedTheme)
    document.documentElement.style.setProperty('--radius', savedRadius)
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme)
      setTheme(localStorage.getItem('theme') || 'light')
    }
  }, [setTheme])

  if (!mounted) return null

  const updateTheme = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
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
    <div className="relative h-full w-full">
      <SheetHeader className="px-6 pt-6">
        <SheetTitle className="flex items-center justify-between">
          <span className="text-2xl font-bold">Appearance</span>
        </SheetTitle>
      </SheetHeader>

      <ScrollArea className="h-[calc(100vh-8rem)] px-6">
        <div className="space-y-6 pb-6">
          <motion.div
            className="space-y-4"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Mode</h3>
              <motion.div layout>
                <Tabs defaultValue={theme} onValueChange={updateTheme}>
                  <TabsList className="grid w-full grid-cols-3 gap-1">
                    <TabsTrigger value="light" className="gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-2">
                      <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
                      Light
                    </TabsTrigger>
                    <TabsTrigger value="dark" className="gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-2">
                      <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
                      Dark
                    </TabsTrigger>
                    <TabsTrigger value="system" className="gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-2">
                      <Monitor className="h-3 w-3 sm:h-4 sm:w-4" />
                      System
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </motion.div>
            </div>

            <Separator />

            <motion.div
              className="space-y-3 sm:space-y-4"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Radius</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 sm:gap-2">
                  {radiusOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={radius === option.value ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        "h-6 sm:h-8 w-full text-[10px] sm:text-xs px-1 sm:px-2",
                        radius === option.value && "border-2 border-primary"
                      )}
                      onClick={() => updateRadius(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>

            <Separator />

            <motion.div
              className="space-y-4"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Color</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(themes).map(([, theme]) => (
                    <motion.div
                      key={theme.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={selectedTheme === theme.name ? 'default' : 'outline'}
                        className={cn(
                          "w-full gap-2 p-4",
                          selectedTheme === theme.name && "border-2 border-primary"
                        )}
                        onClick={() => updateColorTheme(theme.name)}
                      >
                        <span
                          className="relative inline-flex h-5 w-5 shrink-0 rounded-full border shadow-sm"
                          style={{
                            backgroundColor: theme.name === selectedTheme
                              ? `hsl(var(--${theme.name}-primary))`
                              : themeColors[theme.name as keyof typeof themeColors],
                            borderColor: 'hsl(var(--border))'
                          }}
                        >
                          {selectedTheme === theme.name && (
                            <span className="absolute inset-0 rounded-full border-2 border-primary" />
                          )}
                        </span>
                        <span className="text-sm font-medium">{theme.label}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  )
}