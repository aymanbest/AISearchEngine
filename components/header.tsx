import Link from 'next/link'
import { Search,Brush, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeCustomizer } from './theme-customizer'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="relative">
              <Search className="h-6 w-6 text-primary" />
              <Zap className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />
            </div>
            <span className="hidden font-bold sm:inline-block text-primary">
              SmartSeek
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Brush className="h-5 w-5" />
                <span className="sr-only">Open settings</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <ThemeCustomizer />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

