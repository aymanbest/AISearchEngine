"use client"

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ImageGallery } from '@/components/image-gallery'
import { ArrowRight, Globe, ChevronLeft, ChevronRight, Loader2, ChevronDown, Eye, EyeOff, Check, X, MessageCircle} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Card
} from "@/components/ui/card"
import { PrivacyPolicy } from "@/components/privacypolicy"
import { Terms } from '@/components/terms'
import { Progress } from "@/components/ui/progress"

const ITEMS_PER_PAGE = 8

type SearchResult = {
  link: string;
  title: string;
  description: string;
  icon?: string;
  wiki?: boolean;
  image?: string;
}

type Discussion = {
  title: string;
  forumName: string;
  link: string;
  date: string;
  commentCount: string;
  favicon: string;
  content: string;
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
  }>;
  discussions: Array<Discussion>;
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
    ai: false,
    images: true,
    wiki: true,
    sources: true,
    discussions: true
  })
  const [showSearchInput, setShowSearchInput] = useState(true)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)


  interface ApiResponse {
    ok: boolean;
    json(): Promise<ChatResponse>;
    status: number;
  }
  
  interface ChatResponse {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  }

  

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
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      try {
        const [eduidePromise, airforcePromise] = [
          fetch('https://api.eduide.cc/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: selectedModel,
              messages: [
                { role: "system", content: "You are a search engine and should give answers to questions no talking to users or conversing." },
                { role: "user", content: query }
              ]
            }),
            signal: controller.signal
          }) as Promise<ApiResponse>,
          fetch('https://api.airforce/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: selectedModel,
              messages: [
                { role: "system", content: "You are a search engine and should give answers to questions no talking to users or conversing." },
                { role: "user", content: query }
              ]
            }),
            signal: controller.signal
          }) as Promise<ApiResponse>
        ]

        // Try eduide first
        try {
          const eduideResponse = await Promise.race([
            eduidePromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 7000))
          ]) as ApiResponse;
          
          if (eduideResponse.ok) {
            const data = await eduideResponse.json()
            controller.abort()
            clearTimeout(timeoutId)
            return data
          }
        } catch (eduideError) {
          // console.log('Eduide failed:', eduideError)
        }

        // If eduide fails, try airforce
        const airforceResponse: ApiResponse = await airforcePromise;
        if (airforceResponse.ok) {
          const data = await airforceResponse.json()
          clearTimeout(timeoutId)
          return data
        }

        throw new Error('Both APIs failed to respond')

      } catch (error) {
        clearTimeout(timeoutId)
        throw error // This will set isAiError to true
      }
    },
    enabled: false,
    retry: 1
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

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | undefined;
    
    if (isFetching || isLoading) {
      setLoadingComplete(false) // Reset when loading starts
      setShowProgress(true)
      setProgress(0)
      
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) {
            return prev + 5
          }
          return prev
        })
      }, 100)
    } else if (showProgress) {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      setProgress(100)
      
      const timer = setTimeout(() => {
        setShowProgress(false)
        setLoadingComplete(true)
      }, 500)

      return () => clearTimeout(timer)
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }, [isFetching, isLoading])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    setPage(1)
    setSearchInitiated(true)
    setShowSearchInput(false)
    setHideResults(false)
    setLoadingComplete(false)
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
    setLoadingComplete(false)
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


  useEffect(() => {
    if (aiResponse) {
      setExpandedSections(prev => ({ ...prev, ai: true }));
    }
  }, [aiResponse]);

  const renderLoadingState = () => {
    const statusText = progress === 100 ? "Ready" : "Loading..."

    return (
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {progress < 100 ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Check className="h-4 w-4 text-primary" />
              )}
              <p className="text-sm font-medium">{statusText}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>

          <Progress value={progress} className="h-2" />
        </div>
      </Card>
    )
  }

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
        {!showSearchInput && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToSearch}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        )}
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

      {/* Loading State - Keep only this one */}
      <AnimatePresence>
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4"
          >
            {renderLoadingState()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {!hideResults && searchInitiated && loadingComplete && (
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
          {/* Discussions Section */}
        {(data?.discussions || []).length > 0 && (
          
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
                  ) : data?.discussions && data.discussions.length > 0 ? (
                    <Check className="h-3 w-3 text-primary" />
                  ) : (
                    <X className="h-3 w-3 text-destructive" />
                  )}
                </div>
                <h2 className="text-sm font-medium">Discussions</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('discussions')}
              >
                {expandedSections.discussions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <AnimatePresence>
              {expandedSections.discussions && data?.discussions && data.discussions.length > 0 && (
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
                      <p>Failed to load discussions</p>
                    </div>
                  ) : data?.discussions && data.discussions.length > 0 ? (
                    <div className="space-y-4">
                      {data.discussions.map((discussion, i) => (
                        <Card key={i} className="p-4 hover:bg-accent/5">
                          <div className="flex gap-3">
                            {discussion.favicon && (
                              <img 
                                src={discussion.favicon} 
                                alt={discussion.forumName}
                                className="w-4 h-4 mt-1"
                              />
                            )}
                            <div className="space-y-2 flex-1">
                              <div className="flex justify-between">
                                <div className="space-y-1">
                                  <a 
                                    href={discussion.link}
                                    target="_blank"
                                    rel="noopener noreferrer" 
                                    className="font-medium hover:underline block"
                                  >
                                    {discussion.title}
                                  </a>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{discussion.forumName}</span>
                                    <span>•</span>
                                    <span>{discussion.date}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MessageCircle className="h-4 w-4" />
                                  <span>{discussion.commentCount}</span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">{discussion.content}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 text-muted-foreground">
                      No discussions found
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          )}

          {/* Sources Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
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

