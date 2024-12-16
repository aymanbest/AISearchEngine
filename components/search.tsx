"use client"

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ImageGallery } from '@/components/image-gallery'
import { ArrowRight, Globe, ChevronLeft, ChevronRight, Loader2, ChevronDown, Eye, EyeOff, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Card
} from "@/components/ui/card"
import { PrivacyPolicy } from "@/components/privacypolicy"
import { Terms } from '@/components/terms'

const ITEMS_PER_PAGE = 8

type SearchResult = {
  link: string;
  title: string;
  description: string;
  icon?: string;
  wiki?: boolean;
  image?: string;
}

type SearchResponse = {
  query: string;
  region: string;
  time: string;
  totalResults: number;
  results: Array<SearchResult>;
  images: Array<{
    link: string;
    image_source: string;
    image_alt_text: string;
    title: string;
  }>
}

type Suggestion = {
  phrase: string;
}

const AI_MODELS = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-3.5-turbo',
  'claude-v1',
  'claude-v1-100k',
  'claude-instant-v1',
  'claude-instant-v1-100k',
  'palm-2',
  'command-nightly',
  'command-light-nightly',
]

export default function Search() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [page, setPage] = useState(1)
  const [searchInitiated, setSearchInitiated] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  const [expandWiki, setExpandWiki] = useState(false)
  const [hideResults, setHideResults] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    ai: true,
    images: true,
    wiki: true,
    sources: true,
  })
  const [showSearchInput, setShowSearchInput] = useState(true)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, isFetching, refetch } = useQuery<SearchResponse>({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return null
      const response = await fetch(`https://nextjs-cors-anywhere-henna.vercel.app/api?endpoint=https://downliyadapi.vercel.app/search?query=${encodeURIComponent(query)}&region=&time=`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    enabled: false,
  })

  const { data: aiResponse, isLoading: isAiLoading, isError: isAiError, refetch: refetchAi } = useQuery({
    queryKey: ['ai', query, selectedModel],
    queryFn: async () => {
      if (!query) return null
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 seconds timeout
      try {
        const response = await fetch('https://api.eduide.cc/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: "system",
                content: "You are a search engine and should give answers to questions no talking to users or conversing."
              },
              {
                role: "user",
                content: query
              }
            ]
          }),
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        if (!response.ok) {
          throw new Error('AI API request failed')
        }
        return response.json()
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          throw new Error('Request timed out')
        }
        throw error
      }
    },
    enabled: false,
    retry: false,
  })

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 0) {
        const response = await fetch(`https://nextjs-cors-anywhere-henna.vercel.app/api?endpoint=https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setSuggestions(data)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchSuggestions()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    setPage(1)
    setSearchInitiated(true)
    setShowSearchInput(false)
    setHideResults(false)
    refetch()
    refetchAi()
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    setPage(1)
    setSearchInitiated(true)
    setShowSearchInput(false)
    setHideResults(false)
    refetch()
    refetchAi()
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleBackToSearch = () => {
    setShowSearchInput(true)
    setHideResults(true)
  }

  const handleShowResults = () => {
    setShowSearchInput(false)
    setHideResults(false)
  }
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  const wikiResult = data?.results.find((result: SearchResult)  => result.wiki)
  const sourceResults = data?.results.filter((result: SearchResult) => !result.wiki) || []
  const totalPages = Math.ceil(sourceResults.length / ITEMS_PER_PAGE)
  const paginatedResults = sourceResults.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Search Input */}
      <AnimatePresence>
        {showSearchInput && ( // Only show when showSearchInput is true
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <form onSubmit={handleSearch} className="relative">
              <div className="relative flex items-center">
                <Input
                  type="search"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={handleInputBlur}
                  className="w-full h-12 pl-4 pr-32 text-lg bg-background/50 backdrop-blur-sm"
                />
                <div className="absolute right-2 flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        {selectedModel}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0">
                      <ScrollArea className="h-[300px]">
                        <div className="p-4">
                          {AI_MODELS.map((model) => (
                            <div
                              key={model}
                              className="flex items-center space-x-2 py-2 px-4 hover:bg-accent cursor-pointer"
                              onClick={() => setSelectedModel(model)}
                            >
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                selectedModel === model ? "bg-primary" : "bg-muted"
                              )} />
                              <span>{model}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowRight className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef} className="absolute z-10 w-full mt-2 bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full px-4 py-2 text-left hover:bg-accent/50 transition-colors"
                      onClick={() => handleSuggestionClick(suggestion.phrase)}
                    >
                      {suggestion.phrase}
                    </button>
                  ))}
                </div>
              )}
            </form>
            
            {/* Legal Links */}
            <div className="flex justify-center items-center gap-4 mt-4 text-sm text-muted-foreground">
              <PrivacyPolicy />
              <span>•</span>

              <Terms />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        {!showSearchInput && ( // Show "Back to Search" when search input is hidden
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToSearch}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        )}
        {showSearchInput && searchInitiated && ( // Show "Show Results" when search input is visible and search was initiated
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowResults}
          >
            Show Results
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Results */}
      {!hideResults && searchInitiated && ( // Only show results when not hidden and search was initiated
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-8"
        >
          <div className="flex justify-between items-center">
            {showSearchInput && searchInitiated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowResults}
              >
                Show Results
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
          {!hideResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    {isAiLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : isAiError ? (
                      <X className="h-3 w-3 text-destructive" />
                    ) : (
                      <Check className="h-3 w-3 text-primary" />
                    )}
                  </div>
                  <h2 className="text-sm font-medium">AI-Generated Answer</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    Using model: {selectedModel}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('ai')}
                  >
                    {expandedSections.ai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <AnimatePresence>
                {expandedSections.ai && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={cn(
                      "p-6 transition-all duration-300",
                      isAiLoading ? "opacity-50" : ""
                    )}>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {isAiLoading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : isAiError ? (
                          <div className="flex items-center justify-center text-destructive">
                            <X className="h-6 w-6 mr-2" />
                            <p>Failed to load AI-generated answer. Please try again.</p>
                          </div>
                        ) : aiResponse ? (
                          <p>{aiResponse.choices[0].message.content}</p>
                        ) : (
                          <p className="text-muted-foreground">AI-generated answer will appear here.</p>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          {data?.images && data.images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    {isFetching ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : isLoading ? (
                      <X className="h-3 w-3 text-destructive" />
                    ) : (
                      <Check className="h-3 w-3 text-primary" />
                    )}
                  </div>
                  <h2 className="text-sm font-medium">Images</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('images')}
                >
                  {expandedSections.images ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <AnimatePresence>
                {expandedSections.images && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isFetching ? (
                      <div className="flex items-center justify-center p-6">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : isLoading ? (
                      <div className="flex items-center justify-center p-6 text-destructive">
                        <X className="h-6 w-6 mr-2" />
                        <p>Failed to load images. Please try again.</p>
                      </div>
                    ) : (
                      <ImageGallery images={data.images} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {wikiResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    {isFetching ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : isLoading ? (
                      <X className="h-3 w-3 text-destructive" />
                    ) : (
                      <Check className="h-3 w-3 text-primary" />
                    )}
                  </div>
                  <h2 className="text-sm font-medium">Wikipedia</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('wiki')}
                >
                  {expandedSections.wiki ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <AnimatePresence>
                {expandedSections.wiki && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={cn(
                      "p-4 transition-all duration-300",
                      isFetching ? "opacity-50" : "hover:bg-accent/5"
                    )}>
                      {isFetching ? (
                        <div className="flex items-center justify-center p-6">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : isLoading ? (
                        <div className="flex items-center justify-center p-6 text-destructive">
                          <X className="h-6 w-6 mr-2" />
                          <p>Failed to load Wikipedia content. Please try again.</p>
                        </div>
                      ) : (
                        <div className="flex gap-4">
                          {wikiResult.image && (
                            <img
                              src={wikiResult.image}
                              alt={wikiResult.title}
                              className="w-24 h-24 object-cover rounded flex-shrink-0"
                              style={{ objectFit: 'contain' }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium leading-none mb-2">
                              <a
                                href={wikiResult.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {wikiResult.title}
                              </a>
                            </h3>
                            <p className={cn(
                              "text-sm text-muted-foreground",
                              expandWiki ? "" : "line-clamp-3"
                            )}>
                              {wikiResult.description}
                            </p>
                            {!expandWiki && (
                              <Button
                                variant="link"
                                size="sm"
                                className="mt-2 p-0"
                                onClick={() => setExpandWiki(true)}
                              >
                                Read More
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  {isFetching ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : isLoading ? (
                    <X className="h-3 w-3 text-destructive" />
                  ) : (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </div>
                <h2 className="text-sm font-medium">Sources</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('sources')}
              >
                {expandedSections.sources ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <AnimatePresence>
              {expandedSections.sources && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isFetching ? (
                    <div className="flex items-center justify-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center justify-center p-6 text-destructive">
                      <X className="h-6 w-6 mr-2" />
                      <p>Failed to load sources. Please try again.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {paginatedResults.map((result, index) => (
                          <Card
                            key={index}
                            className={cn(
                              "p-4 transition-all duration-300",
                              "hover:bg-accent/5"
                            )}
                          >
                            <div className="flex gap-4 items-center">
                              <div className="flex-none">
                                {result.icon ? (
                                  <img
                                    src={result.icon}
                                    alt=""
                                    className="w-6 h-6 rounded"
                                  />
                                ) : (
                                  <Globe className="w-6 h-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium leading-none mb-2">
                                  <a
                                    href={result.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    {result.title}
                                  </a>
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {result.description}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center mt-4 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

