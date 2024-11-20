# AI-Powered Search Engine

A modern search engine application built with React that combines web search results with AI-powered answers and image generation capabilities.

## Features

- 🔍 Web search with DuckDuckGo integration
- 🤖 AI-powered answers using multiple language models:
  - GPT-4
  - GPT-4 Mini
  - Mixtral 8x7B
  - Claude 3 Haiku
  - Llama 3 70B
- 🎨 AI Image Generation with models:
  - SDXL
  - Stable Diffusion 3
  - Playground v2.5
  - Flux Realism
- 🌗 Dark/Light mode support
- 💡 Search suggestions with autocomplete
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```sh
git clone https://github.com/aymanbest/AISearchEngine.git
cd searchengine
```

2. Install dependencies:
```sh
npm install
```

3. Create a 

.env

 file in the root directory and add your environment variables:
```
REACT_APP_CORS_PROXY_URL=your_cors_proxy_url
REACT_APP_DUCKDUCKGO_ENDPOINT=your_duckduckgo_endpoint
REACT_APP_AI_API_EDUIDE=api.ed_url
REACT_APP_AI_SYSTEM_PROMPT=your_system_prompt
REACT_APP_AI_API_AIRFORCE=api.forc_url
```

4. Start the development server:
```sh
npm start
```

The app will be available at `http://localhost:3000`

## Building for Production

To create a production build:

```sh
npm run build
```

## Technologies Used

- React
- Tailwind CSS
- DuckDuckGo API
- Various AI Models
- @tabler/icons-react

## Project Structure

```
src/
  ├── components/
  │   ├── AISearch.js      # AI answer generation
  │   ├── ImageGenerator.js # AI image generation
  │   ├── SearchBar.js     # Search input and suggestions
  │   ├── SearchResults.js # Web search results display
  │   └── SuggestionsList.js # Search suggestions
  ├── App.js
  └── index.js
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
```