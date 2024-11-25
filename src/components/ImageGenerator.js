import React, { useState } from 'react';
import { IconPhoto, IconLoader2, IconDownload, IconPalette, IconBrain } from '@tabler/icons-react';
import { MODELSIMAGE } from '../constants/models';

const secureImageUrl = (url) => {
  if (!url) return '';
  return url.replace(/^http:/, 'https:');
};

const DrawingLoader = () => (
  <div className="mt-4 h-64 bg-gray-200 dark:bg-gray-800/50 rounded-xl border border-gray-300 dark:border-gray-700/50 
      backdrop-blur-sm shadow-lg overflow-hidden relative group">
    <div className="absolute inset-0 opacity-20">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 
          animate-gradient-x" />
      <div className="grid grid-cols-8 grid-rows-4 gap-4 p-4 h-full w-full">
        {[...Array(32)].map((_, i) => (
          <div key={i}
            className="bg-white/10 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>

    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <IconPalette
          size={48}
          className="text-blue-500 animate-bounce"
          style={{ animationDuration: '2s' }}
        />
        <div className="absolute inset-0 blur-xl bg-blue-500/20 animate-pulse" />
      </div>
    </div>

    <div className="absolute bottom-4 left-0 right-0 text-center text-gray-400">
      <p className="text-sm animate-pulse">Generating your masterpiece...</p>
    </div>
  </div>
);

function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('flux-realism');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [openSort, setOpenSort] = useState(false);

  const generateImage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      let response;
      if (model.startsWith('flux')) {
        const url = `${process.env.REACT_APP_AI_API_AIRFORCE}v1/imagine2?prompt=${encodeURIComponent(prompt)}&size=1:1&seed=${Math.floor(Math.random() * 1000000)}&model=${model}`;
        response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          setImageUrl(imageUrl);
        } else {
          setError('Failed to generate image');
        }
      } else {
        response = await fetch(process.env.REACT_APP_AI_API_EDUIDE + 'v1/imagine', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt, model })
        });

        const data = await response.json();
        if (data.data && data.data[0]?.url) {
          setImageUrl(data.data[0].url);
        } else {
          setError('Failed to generate image');
        }
      }
    } catch (err) {
      setError('Error generating the image. Trying a different model might help.');
      console.error('Image generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (imageUrl, imageName) => {
    try {
      const secureUrl = secureImageUrl(imageUrl);
      const response = await fetch(secureUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageName || 'generated-image.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const toKebabCase = (str) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') 
      .replace(/^-+|-+$/g, ''); 
  };

  const handleDownload = (imageUrl, prompt) => {
    const kebabPrompt = toKebabCase(prompt);
    const timestamp = Date.now();
    const imageName = `${kebabPrompt}-${timestamp}.png`;
    downloadImage(imageUrl, imageName);
  };
  
  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      <form onSubmit={generateImage} className="space-y-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenSort(!openSort)}
            className="flex items-center justify-start w-40 py-2 mt-2 text-sm font-semibold text-left rounded-lg"
          >
            <IconBrain size={15} className="mr-2" />
            <span>{MODELSIMAGE.find(m => m.id === model)?.name || 'Select Model'}</span>
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              className={`w-4 h-4 transition-transform duration-200 transform ${openSort ? 'rotate-180' : 'rotate-0'}`}
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
          {openSort && (
            <div
              className="absolute z-50 w-full mt-2 origin-top-right bg-white rounded-md shadow-lg dark:bg-gray-700 transition ease-out duration-100 transform opacity-100 scale-100"
            >
              <div className="px-2 pt-2 pb-2">
                <div className="flex flex-col">
                  {MODELSIMAGE.map(({ id, name }) => (
                    <button
                      key={id}
                      onClick={() => {
                        setModel(id);
                        setOpenSort(false);
                      }}
                      className="flex flex-row items-center p-2 rounded-lg bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <IconBrain size={15} className="mr-2" />
                      <div>
                        <p className="font-semibold">{name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/0 via-blue-600/20 to-blue-600/0 
              rounded-xl opacity-0 group-focus-within:opacity-100 blur-lg
              transition-all duration-500" />

          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full px-5 py-3 rounded-xl
                bg-gray-200 dark:bg-gray-800/50
                border border-gray-300 dark:border-gray-700/50
                focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
                transition-all duration-300
                text-gray-900 dark:text-gray-200 placeholder:text-gray-500
                relative z-10"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2
                p-2 rounded-lg
                bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700
                transition-all duration-300 transform hover:scale-105
                disabled:hover:scale-100 disabled:opacity-50
                z-10"
            >
              {loading ? (
                <IconLoader2 className="animate-spin text-white" size={20} />
              ) : (
                <IconPhoto size={20} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-200 dark:bg-red-900/30 border border-red-300 dark:border-red-500/50 
            text-red-900 dark:text-red-200 rounded-xl backdrop-blur-sm
            animate-fade-in">
          {error}
        </div>
      )}

      {loading ? (
        <DrawingLoader />
      ) : (
        imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden
              border border-gray-300 dark:border-gray-700/50 shadow-lg
              transition-all duration-500 animate-fade-in
              group relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <img
              src={imageUrl}
              alt={prompt}
              className="w-full h-auto transition-transform duration-500
                group-hover:scale-105"
              loading="lazy"
            />

            {/* Controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4
                transform translate-y-full group-hover:translate-y-0
                transition-transform duration-300
                bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-start justify-between gap-4">
                <p className="text-white text-sm opacity-90 line-clamp-2 flex-1">
                  {prompt}
                </p>
                <button
                  onClick={() => handleDownload(imageUrl, prompt)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                    bg-blue-500/80 hover:bg-blue-500
                    text-white text-sm font-medium
                    transform hover:scale-105
                    transition-all duration-300"
                >
                  <IconDownload size={16} />
                  Download
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default ImageGenerator;