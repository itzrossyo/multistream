'use client';

import React, {useState, useRef, useEffect, memo, useCallback} from 'react';
import {Plus, X, Volume2, VolumeX, Maximize2, Settings} from 'lucide-react';

const getEmbedUrl = (stream) => {
    if (stream.platform === 'twitch') {
        return `https://player.twitch.tv/?channel=${stream.channel}&parent=localhost&parent=claude.ai`;
    } else if (stream.platform === 'kick') {
        return `https://player.kick.com/${stream.channel}`;
    }
    return '';
};

const StreamWindow = memo(({stream, onMute, onRemove}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const iframeRef = useRef(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
            const message = stream.muted ? {command: 'mute'} : {command: 'unmute'};

            iframe.contentWindow.postMessage(message, '*');
        }
    }, [stream.muted]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!isFullscreen && iframeRef.current) {
            if (iframeRef.current.requestFullscreen) {
                iframeRef.current.requestFullscreen();
                setIsFullscreen(true);
            }
        }
    };

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg relative group">
            <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${stream.platform === 'twitch' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                    <span className="text-white text-sm font-medium capitalize">
                        {stream.platform} - {stream.channel}
                    </span>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={() => onMute(stream.id)} className="text-gray-400 hover:text-white p-1 rounded transition-colors" title={stream.muted ? 'Unmute' : 'Mute'}>
                        {stream.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <button onClick={toggleFullscreen} className="text-gray-400 hover:text-white p-1 rounded transition-colors" title="Fullscreen">
                        <Maximize2 size={16} />
                    </button>
                    <button onClick={() => onRemove(stream.id)} className="text-gray-400 hover:text-red-400 p-1 rounded transition-colors" title="Remove stream">
                        <X size={16} />
                    </button>
                </div>
            </div>
            <div className="relative aspect-video">
                <iframe
                    ref={iframeRef}
                    src={getEmbedUrl(stream)}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title={`${stream.platform} stream - ${stream.channel}`}
                    key={`${stream.id}-${stream.channel}`}
                />
            </div>
        </div>
    );
});

StreamWindow.displayName = 'StreamWindow';

const MultiStreamViewer = () => {
    const [streams, setStreams] = useState([
        {id: 1, platform: 'twitch', channel: 'mikars', muted: true},
        {id: 2, platform: 'twitch', channel: 'alfie', muted: true},
        {id: 3, platform: 'twitch', channel: 'muts', muted: true},
        {id: 4, platform: 'twitch', channel: 'mmorpg', muted: true},
        {id: 5, platform: 'twitch', channel: 'purpp', muted: true},
        {id: 6, platform: 'twitch', channel: 'coxie', muted: true},
        {id: 7, platform: 'twitch', channel: 'verf', muted: true},
        {id: 8, platform: 'kick', channel: 'rhys', muted: true},
        {id: 9, platform: 'kick', channel: 'sick_nerd', muted: true},
        {id: 10, platform: 'kick', channel: 'odablock', muted: true},
    ]);
    const [newStreamUrl, setNewStreamUrl] = useState('');
    const [gridCols, setGridCols] = useState(2);
    const [showAddStream, setShowAddStream] = useState(false);

    const parseStreamUrl = useCallback((url) => {
        const twitchMatch = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
        if (twitchMatch) {
            return {platform: 'twitch', channel: twitchMatch[1]};
        }

        const kickMatch = url.match(/kick\.com\/([a-zA-Z0-9_]+)/);
        if (kickMatch) {
            return {platform: 'kick', channel: kickMatch[1]};
        }

        if (url && !url.includes('/')) {
            return {platform: 'twitch', channel: url};
        }

        return null;
    }, []);

    const addStream = useCallback(() => {
        const parsed = parseStreamUrl(newStreamUrl);
        if (parsed) {
            const newStream = {
                id: Date.now(),
                platform: parsed.platform,
                channel: parsed.channel,
                muted: true,
            };
            setStreams((prev) => [...prev, newStream]);
            setNewStreamUrl('');
            setShowAddStream(false);
        }
    }, [newStreamUrl, parseStreamUrl]);

    const removeStream = useCallback((id) => {
        setStreams((prev) => prev.filter((stream) => stream.id !== id));
    }, []);

    const toggleMute = useCallback((id) => {
        setStreams((prev) => prev.map((stream) => (stream.id === id ? {...stream, muted: !stream.muted} : {...stream, muted: true})));
    }, []);

    return (
        <div className="min-h-screen p-4 bg-black">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white  mb-4">Multi-Stream Viewer</h1>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <button onClick={() => setShowAddStream(!showAddStream)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                        <Plus size={20} />
                        <span>Add Stream</span>
                    </button>

                    {/* Grid  layout*/}
                    <div className="flex items-center space-x-2">
                        <Settings size={20} className="text-white" />
                        <label className="text-white font-medium">Grid:</label>
                        <select value={gridCols} onChange={(e) => setGridCols(Number(e.target.value))} className="border border-gray-300 text-white rounded px-3 py-1">
                            <option value={1}>1 Column</option>
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                            <option value={4}>4 Columns</option>
                            <option value={5}>5 Columns</option>
                            <option value={6}>6 Columns</option>
                            <option value={7}>7 Columns</option>
                            <option value={8}>8 Columns</option>
                            <option value={9}>9 Columns</option>
                            <option value={10}>10 Columns</option>
                        </select>
                    </div>
                </div>

                {/* Add Stream Form */}
                {showAddStream && (
                    <div className="bg-white text-black p-4 rounded-lg shadow-md mb-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newStreamUrl}
                                onChange={(e) => setNewStreamUrl(e.target.value)}
                                placeholder="Enter Twitch/Kick URL or channel name (e.g., twitch.tv/shroud or just 'shroud')"
                                className="flex-1 border border-gray-300 rounded px-3 py-2"
                            />
                            <button onClick={addStream} className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded transition-colors">
                                Add
                            </button>
                            <button onClick={() => setShowAddStream(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors">
                                Cancel
                            </button>
                        </div>
                        <p className="text-sm text-black mt-2">Supported formats: twitch.tv/username, kick.com/username, or just the username</p>
                    </div>
                )}
            </div>

            {/* Streams Grid */}
            {streams.length > 0 ? (
                <div className="grid gap-4" style={{gridTemplateColumns: `repeat(${gridCols}, 1fr)`}}>
                    {streams.map((stream) => (
                        <StreamWindow key={stream.id} stream={stream} onMute={toggleMute} onRemove={removeStream} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No streams added yet</p>
                    <button onClick={() => setShowAddStream(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
                        Add Your First Stream
                    </button>
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-gray-600 text-sm">
                <p>Click the volume icon to unmute a stream. Only one stream can be unmuted at a time.</p>
            </div>
        </div>
    );
};

export default MultiStreamViewer;
