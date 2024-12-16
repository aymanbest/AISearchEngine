"use client"

import * as React from "react"
import { Dialog, DialogContent} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus } from 'lucide-react'

interface ImageGalleryProps {
  images: Array<{
    link: string
    image_source: string
    image_alt_text: string
    title: string
  }>
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [open, setOpen] = React.useState(false)

  const displayImages = images.slice(0, 4)
  const hasMore = images.length > 4

  return (
    <>
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {displayImages.slice(0, 3).map((image, index) => (
            <div
              key={index}
              className="flex-none group relative w-64 aspect-[4/3] overflow-hidden rounded-lg bg-background ring-2 ring-background hover:ring-primary/50 transition-all"
            >
              <img
                src={image.image_source}
                alt={image.image_alt_text}
                className="absolute inset-0 h-full w-full object-cover"
                onClick={() => setOpen(true)}
              />
            </div>
          ))}
          {displayImages.length > 3 && (
            <div
              className="flex-none group relative w-64 aspect-[4/3] overflow-hidden rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
            >
              <img
                src={displayImages[3].image_source}
                alt={displayImages[3].image_alt_text}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <button
                onClick={() => setOpen(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-black/60 transition-colors"
              >
                {hasMore && (
                  <Plus className="h-8 w-8 text-white group-hover:text-white/90 transition-colors" />
                )}
              </button>
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-background"
                >
                  <img
                    src={image.image_source}
                    alt={image.image_alt_text}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}