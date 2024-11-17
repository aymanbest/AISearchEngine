import React, { useState } from 'react';
import { IconPhoto, IconLoader2, IconPencil } from '@tabler/icons-react';

const DrawingLoader = () => (
  <div className="mt-4 h-64 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center overflow-hidden">
    <div className="relative w-24 h-24">
      <IconPencil
        size={96}
        className="absolute top-0 left-0 text-blue-500 animate-drawing"
      />
      <style jsx>{`
        @keyframes draw {
          0% { transform: translate(-50px, -50px) rotate(0deg); }
          25% { transform: translate(50px, -50px) rotate(90deg); }
          50% { transform: translate(50px, 50px) rotate(180deg); }
          75% { transform: translate(-50px, 50px) rotate(270deg); }
          100% { transform: translate(-50px, -50px) rotate(360deg); }
        }
        .animate-drawing {
          animation: draw 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  </div>
);

const MODELS = [
  { id: 'sdxl', name: 'SDXL' },
  { id: 'sd-3', name: 'Stable Diffusion 3' },
  { id: 'playground-v2.5', name: 'Playground v2.5' },
  { id: 'flux-realism', name: 'Flux Realism' }
];

function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('flux-realism');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const generateImage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await fetch(process.env.REACT_APP_AI_API_IMAGE, {
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
    } catch (err) {
      setError('Error generating image');
      console.error('Image generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      <form onSubmit={generateImage} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="w-full p-4 pl-6 pr-12 rounded-full border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full transition-colors"
          >
            {loading ? <IconLoader2 className="animate-spin" size={20} /> : <IconPhoto size={20} />}
          </button>
        </div>

        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full p-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          {MODELS.map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg transition-opacity duration-300">
          {error}
        </div>
      )}

      {loading ? (
        <DrawingLoader />
      ) : (
        imageUrl && (
          <div className="mt-4 overflow-hidden rounded-lg shadow-lg transition-opacity duration-500">
            <img 
              src={imageUrl} 
              alt={prompt}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        )
      )}
    </div>
  );
}

export default ImageGenerator;