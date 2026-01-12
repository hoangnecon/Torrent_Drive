"use client"
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useApi } from "@/context/ApiContext";
import { Button, Card, Input, Progress } from "@/components/ui-components";
import { Download, Upload, Server, HardDrive, Plus, Play, Pause, X, Loader2 } from "lucide-react";

interface Torrent {
    name: string;
    progress: number;
    state: string;
    download_rate: number;
    upload_rate: number;
    total_done: number;
    total_size: number;
    peers: number;
    info_hash?: string;
    elapsed?: number;
}

export default function Dashboard() {
    const { apiUrl, isConnected } = useApi();
    const router = useRouter();
    const [torrents, setTorrents] = useState<Torrent[]>([]);
    const [linkInput, setLinkInput] = useState("");
    const [adding, setAdding] = useState(false);
    const [loading, setLoading] = useState(true);

    // Poll for data
    useEffect(() => {
        if (!apiUrl) {
            router.push("/");
            return;
        }

        const fetchData = async () => {
            try {
                const res = await axios.get(`${apiUrl}/torrents`);
                setTorrents(res.data);
                setLoading(false);
            } catch (e) {
                console.error("Poll failed", e);
            }
        };

        fetchData(); // Initial
        const interval = setInterval(fetchData, 2000); // Poll every 2s
        return () => clearInterval(interval);
    }, [apiUrl, router]);

    const handleAdd = async () => {
        if (!linkInput.trim()) return;
        setAdding(true);

        // Split by newline to support multiple links
        const links = linkInput.split('\n').filter(l => l.trim().length > 0);

        // Limit to 50 at once matching backend V4 config
        const batch = links.slice(0, 50);

        for (const link of batch) {
            try {
                await axios.post(`${apiUrl}/add`, { link: link.trim() });
            } catch (e) {
                console.error("Failed to add", link);
            }
        }

        setLinkInput("");
        setAdding(false);
        // Fetch immediately
        try {
            const res = await axios.get(`${apiUrl}/torrents`);
            setTorrents(res.data);
        } catch { }
    };

    const handleControl = async (infoHash: string | undefined, action: string) => {
        if (!infoHash) return;
        try {
            await axios.post(`${apiUrl}/control`, { info_hash: infoHash, action });
            // Optimistic update or just wait for poll
            const res = await axios.get(`${apiUrl}/torrents`);
            setTorrents(res.data);
        } catch (e) {
            console.error("Control action failed", e);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return "00:00:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getStateColor = (state: string) => {
        if (state === 'downloading' || state === 'seeding') return 'text-green-400';
        if (state === 'moving_to_drive') return 'text-blue-400';
        if (state === 'paused') return 'text-orange-400';
        if (state === 'checking' || state === 'fetching_metadata') return 'text-yellow-400';
        if (state === 'completed') return 'text-purple-400';
        return 'text-gray-400';
    }

    const getStateLabel = (state: string) => {
        switch (state) {
            case 'moving_to_drive': return 'MOVING TO DRIVE...';
            case 'downloading': return 'DOWNLOADING';
            case 'seeding': return 'SEEDING';
            case 'checking': return 'CHECKING';
            case 'fetching_metadata': return 'METADATA';
            case 'completed': return 'DONE';
            default: return state.toUpperCase();
        }
    }

    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <main className="min-h-screen p-6 bg-background text-white relative">
            {/* Header */}
            <header className="flex justify-between items-center mb-8 glass p-4 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-full">
                        <Server size={20} className="text-green-400" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">Colab Connected</h1>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{apiUrl}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-xl font-mono font-bold text-primary">
                            {time.toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {time.toLocaleDateString()}
                        </p>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">Storage: Google Drive</p>
                        <p className="text-xs text-muted-foreground">Auto-sync enabled</p>
                    </div>
                    <HardDrive className="text-primary" />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Add Torrent */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-t border-primary/20">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Plus className="text-primary" size={20} /> Add Torrent
                        </h2>
                        <div className="space-y-4">
                            <textarea
                                placeholder="Paste Magnet Links here (One per line, max 50)..."
                                className="w-full h-32 rounded-lg glass-input p-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                                value={linkInput}
                                onChange={(e) => setLinkInput(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleAdd}
                                    disabled={adding || !linkInput}
                                    className="w-full"
                                >
                                    {adding ? <Loader2 className="animate-spin mr-2" size={16} /> : 'Start Download'}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <h3 className="text-sm font-semibold mb-2 text-primary">Info</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Files are downloaded directly to your Google Drive folder <code>/TorrentDownloads</code>.
                            Don't close the Colab tab to ensure the backend keeps running.
                        </p>
                    </div>
                </div>

                {/* Right: List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold mb-4">Active Downloads ({torrents.length})</h2>

                    {loading && torrents.length === 0 ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : (
                        <AnimatePresence>
                            {torrents.map((t, i) => (
                                <motion.div
                                    key={t.info_hash || i} // Fallback key
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-sm truncate max-w-[70%]" title={t.name}>
                                            {t.name || "Fetching Metadata..."}
                                        </h3>
                                        <span className={`text-xs px-2 py-1 rounded-full bg-white/5 uppercase font-bold tracking-wider flex items-center gap-2 ${getStateColor(t.state)}`}>
                                            {t.state === 'moving_to_drive' && <Loader2 size={12} className="animate-spin" />}
                                            {getStateLabel(t.state)}
                                        </span>
                                    </div>

                                    <div className="space-y-1 mb-3">
                                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                            <span>{formatSize(t.total_done)} / {formatSize(t.total_size)}</span>
                                            <div className="flex gap-3">
                                                <span className="font-mono text-primary/80">{formatDuration(t.elapsed)}</span>
                                                <span>{t.progress.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                        <Progress value={t.progress} className="h-1.5" />
                                    </div>

                                    <div className="flex justify-between items-center text-xs mt-3 bg-black/20 p-2 rounded-lg">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1 text-green-400">
                                                <Download size={12} /> {formatSize(t.download_rate)}/s
                                            </div>
                                            <div className="flex items-center gap-1 text-blue-400">
                                                <Upload size={12} /> {formatSize(t.upload_rate)}/s
                                            </div>
                                        </div>
                                        <div className="text-gray-500 mr-auto ml-4">
                                            Peers: {t.peers}
                                        </div>

                                        <div className="flex gap-2">
                                            {t.state === 'paused' || t.state === 'checking' ? (
                                                <button
                                                    onClick={() => handleControl(t.info_hash, 'resume')}
                                                    className="p-1 hover:bg-white/10 rounded text-green-400" title="Resume">
                                                    <Play size={14} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleControl(t.info_hash, 'pause')}
                                                    className="p-1 hover:bg-white/10 rounded text-yellow-400" title="Pause">
                                                    <Pause size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleControl(t.info_hash, 'delete')}
                                                className="p-1 hover:bg-white/10 rounded text-red-400" title="Delete">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {!loading && torrents.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                            <p className="text-muted-foreground">No active downloads</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
