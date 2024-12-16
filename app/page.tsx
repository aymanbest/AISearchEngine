"use client"

import { useState, useEffect, useMemo } from 'react'
import Layout from '@/components/layout'
import Search from '@/components/search'
import { SearchIcon, Zap, Star, Sparkles, Lightbulb } from 'lucide-react'

const icons = [SearchIcon, Star, Sparkles, Lightbulb]

interface IconPosition {
  icon: typeof SearchIcon
  x: number
  y: number
  size: number
  rotation: number
}

export default function Home() {
  const [mouseSpeed, setMouseSpeed] = useState(0)
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 })
  const [iconPositions, setIconPositions] = useState<IconPosition[]>([])

  const zapBrightness = useMemo(() => {
    return Math.min(1 + mouseSpeed / 50, 3)
  }, [mouseSpeed])

  useEffect(() => {
    const newPositions: IconPosition[] = []
    for (let i = 0; i < 70; i++) {
      newPositions.push({
        icon: icons[Math.floor(Math.random() * icons.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 30 + 10,
        rotation: Math.random() * 360,
      })
    }
    setIconPositions(newPositions)
  }, [])

  useEffect(() => {
    let lastTime = performance.now()
    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = performance.now()
      const timeDiff = currentTime - lastTime
      const distance = Math.sqrt(
        Math.pow(e.clientX - lastMousePosition.x, 2) +
        Math.pow(e.clientY - lastMousePosition.y, 2)
      )
      const speed = distance / timeDiff
      setMouseSpeed(speed)
      setLastMousePosition({ x: e.clientX, y: e.clientY })
      lastTime = currentTime
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [lastMousePosition])

  return (
    <Layout>
      <div className="relative min-h-screen bg-gradient-to-b from-background to-secondary/20 overflow-hidden">
        {iconPositions.map((icon, index) => (
          <icon.icon
            key={index}
            className="absolute text-primary/10 transition-transform duration-300 ease-out hover:text-primary/30 hover:scale-110"
            style={{
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              fontSize: `${icon.size}px`,
              transform: `rotate(${icon.rotation}deg)`,
            }}
          />
        ))}
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center mb-12">
            <div className="relative">
              <SearchIcon className="h-20 w-20 text-primary mb-4" />
              <Zap 
                className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400 transition-all duration-300 hover:text-yellow-300 hover:scale-110"
                style={{ filter: `brightness(${zapBrightness})` }}
              />
            </div>
            <h1 className="text-4xl font-bold text-center mb-2">SmartSeek</h1>
            <p className="text-xl text-center text-muted-foreground">Intelligent search at your fingertips</p>
          </div>
          <Search />
        </div>
      </div>
    </Layout>
  )
}

