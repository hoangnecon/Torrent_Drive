"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useApi } from "@/context/ApiContext";
import { Button, Card, Input } from "@/components/ui-components";
import { Link2, ShieldCheck, AlertCircle } from "lucide-react";

export default function Home() {
  const { apiUrl, setApiUrl, checkConnection, isConnected } = useApi();
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // If already connected, redirect
    if (isConnected) {
      router.push("/dashboard");
    } else if (apiUrl) {
      // Try auto-reconnect
      handleConnect(apiUrl);
    }
  }, [isConnected, router, apiUrl]);

  const handleConnect = async (url: string) => {
    if (!url) return;
    setLoading(true);
    setError("");
    const valid = await checkConnection(url);
    setLoading(false);
    if (valid) {
      setApiUrl(url);
      router.push("/dashboard");
    } else {
      setError("Cannot connect to Colab. Check URL or ensure Colab is running.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-t border-white/20">
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 rounded-full bg-primary/10 mb-4 border border-primary/20">
              <Link2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Colab Torrent
            </h1>
            <p className="text-muted-foreground text-sm mt-2 text-center">
              Connect to your Google Colab instance to start high-speed downloads directly to Drive.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Input
                placeholder="https://cool-tunnel-url.trycloudflare.com"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="text-center"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 text-red-400 text-xs justify-center bg-red-500/10 p-2 rounded-lg"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}

            <Button
              className="w-full h-11"
              onClick={() => handleConnect(inputUrl)}
              disabled={loading || !inputUrl}
            >
              {loading ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}
