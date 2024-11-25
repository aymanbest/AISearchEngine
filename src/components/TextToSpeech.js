import React, { useState, useRef, useEffect } from 'react';
import { IconVolume, IconLoader2, IconBrain, IconDownload, IconGenderFemme, IconGenderMale, IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react';
// import axios from 'axios';

function TextToSpeech() {
    const [text, setText] = useState('');
    const [voice, setVoice] = useState('alex');
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [error, setError] = useState(null);
    const [openSort, setOpenSort] = useState(false);
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState('0:00');
    const [totalDuration, setTotalDuration] = useState('0:00');
    const [progress, setProgress] = useState(0);

    const handleConvert = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setAudioUrl(null);
    
        try {
            const response = await fetch(`${process.env.REACT_APP_AI_API_AIRFORCE}get-audio?text=${encodeURIComponent(text)}&voice=${voice}`, {
                method: 'GET',
                headers: {
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Authorization": "Bearer missing api key",
                    "Origin": "https://llmplayground.net",
                    "Referer": "https://llmplayground.net/",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch audio');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
    
            // const url = URL.createObjectURL(response.data);
            // setAudioUrl(url);
        } catch (err) {
            setError('Failed to convert text to speech');
            console.error('Text-to-speech error:', err);
        } finally {
            setLoading(false);
        }
    };

    const downloadAudio = async (audioUrl) => {
        try {
            const response = await fetch(audioUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'converted-speech-'+voice+'.mp3';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download audio. Please try again.');
        }
    };

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const updateProgress = () => {
                setCurrentTime(formatTime(audio.currentTime));
                setProgress((audio.currentTime / audio.duration) * 100);
            };

            const setDuration = () => {
                setTotalDuration(formatTime(audio.duration));
            };

            audio.addEventListener('timeupdate', updateProgress);
            audio.addEventListener('loadedmetadata', setDuration);

            return () => {
                audio.removeEventListener('timeupdate', updateProgress);
                audio.removeEventListener('loadedmetadata', setDuration);
            };
        }
    }, [audioUrl]);

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
                    <IconVolume
                        size={48}
                        className="text-blue-500 animate-bounce"
                        style={{ animationDuration: '2s' }}
                    />
                    <div className="absolute inset-0 blur-xl bg-blue-500/20 animate-pulse" />
                </div>
            </div>

            <div className="absolute bottom-4 left-0 right-0 text-center text-gray-400">
                <p className="text-sm animate-pulse">Converting your text to speech...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto mt-8 space-y-6">
            <form onSubmit={handleConvert} className="space-y-4">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setOpenSort(!openSort)}
                        className="flex items-center justify-start w-40 py-2 mt-2 text-sm font-semibold text-left rounded-lg"
                    >
                        <IconBrain size={15} className="mr-2" />
                        <span>{voice === 'alex' ? 'Alex' : 'Sophia'}</span>
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
                                    <button
                                        onClick={() => {
                                            setVoice('alex');
                                            setOpenSort(false);
                                        }}
                                        className="flex flex-row items-center p-2 rounded-lg bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                                    >
                                        <IconGenderMale size={15} className="mr-2" />
                                        <div>
                                            <p className="font-semibold">Alex</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setVoice('sophia');
                                            setOpenSort(false);
                                        }}
                                        className="flex flex-row items-center p-2 rounded-lg bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                                    >
                                        <IconGenderFemme size={15} className="mr-2" />
                                        <div>
                                            <p className="font-semibold">Sophia</p>
                                        </div>
                                    </button>
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
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text to convert to speech..."
                            className="w-full px-5 py-3 rounded-xl
                bg-gray-200 dark:bg-gray-800/50
                border border-gray-300 dark:border-gray-700/50
                focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
                transition-all duration-300
                text-gray-900 dark:text-gray-200 placeholder:text-gray-500
                relative z-10"
                            rows="4"
                        />
                        <button
                            type="submit"
                            disabled={loading || !text.trim()}
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
                                <IconVolume size={20} className="text-white" />
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
                audioUrl && (
                    <div className="mt-6 transform transition-all duration-300 hover:scale-[1.01]">
                        <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl dark:shadow-slate-900/50">
                            <div className="p-6 space-y-6">
                                {/* Header */}
                                <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 dark:shadow-cyan-500/10">
                                        {isPlaying ? (
                                            <IconVolume size={24} className="text-white animate-pulse" />
                                        ) : (
                                            <IconVolume size={24} className="text-white" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                            Generated Audio
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center">
                                            {voice === 'alex' ? (
                                                <IconGenderMale size={16} className="mr-1" />
                                            ) : (
                                                <IconGenderFemme size={16} className="mr-1" />
                                            )}
                                            {voice === 'alex' ? 'Alex' : 'Sophia'} Voice
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="relative group">
                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden transition-colors">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400 transition-all duration-150 group-hover:from-cyan-400 group-hover:to-blue-400 dark:group-hover:from-cyan-300 dark:group-hover:to-blue-300"
                                                style={{ width: `${progress}%` }}
                                                onClick={(e) => {
                                                    const bounds = e.currentTarget.getBoundingClientRect();
                                                    const percent = (e.clientX - bounds.left) / bounds.width;
                                                    if (audioRef.current) {
                                                        audioRef.current.currentTime = audioRef.current.duration * percent;
                                                    }
                                                }}
                                                role="progressbar"
                                                aria-label="music progress"
                                                aria-valuenow={progress}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            />
                                        </div>
                                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 dark:from-cyan-400/10 dark:to-blue-400/10 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-cyan-600 dark:text-cyan-400 tabular-nums">{currentTime}</span>
                                        <span className="text-slate-500 dark:text-slate-400 tabular-nums">{totalDuration}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="border-t border-slate-200/50 dark:border-slate-700/50 px-6 py-4 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={togglePlayPause}
                                    className="relative group"
                                >
                                    <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 dark:from-cyan-400/10 dark:to-blue-400/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400 hover:from-cyan-400 hover:to-blue-400 dark:hover:from-cyan-300 dark:hover:to-blue-300 text-white w-12 h-12 rounded-full flex items-center justify-center transform transition-all duration-200 hover:scale-105 shadow-lg shadow-cyan-500/25 dark:shadow-cyan-500/10">
                                        {isPlaying ? (
                                            <IconPlayerPause size={24} />
                                        ) : (
                                            <IconPlayerPlay size={24} className="ml-1" />
                                        )}
                                    </div>
                                </button>

                                <button
                                    onClick={() => downloadAudio(audioUrl)}
                                    className="flex items-center space-x-2 px-6 py-2.5 rounded-xl 
            bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400 
            hover:from-cyan-400 hover:to-blue-400 dark:hover:from-cyan-300 dark:hover:to-blue-300
            text-white font-medium transform transition-all duration-200 hover:scale-105
            shadow-lg shadow-cyan-500/25 dark:shadow-cyan-500/10"
                                >
                                    <IconDownload size={20} />
                                    <span>Download Audio</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}

export default TextToSpeech;