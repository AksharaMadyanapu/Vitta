import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Server } from 'lucide-react';
import { api } from '@/api/client';

export const ServerHealthCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(true);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    let timer: any;
    let progressInterval: any;
    let isMounted = true;

    const checkServer = async () => {
      // If server doesn't respond within 1.5s, it might be cold-starting
      timer = setTimeout(() => {
        if (isMounted) setIsWakingUp(true);
      }, 1500);

      progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 800);

      try {
        const health = await api.getHealth();
        if (health.status === 'warming_up') {
          if (isMounted) setIsWakingUp(true);
          // Wait 2 seconds and re-check
          setTimeout(checkServer, 2000);
          return;
        }
        if (isMounted) {
          clearTimeout(timer);
          clearInterval(progressInterval);
          setIsWakingUp(false);
          setIsReady(true);
        }
      } catch (err) {
        if (isMounted) {
          setIsWakingUp(true);
          // Retry every 3 seconds
          setTimeout(checkServer, 3000);
        }
      }
    };

    checkServer();

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {isWakingUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#FBF7F0]/95 backdrop-blur-md p-6"
          >
            <div className="max-w-md w-full bg-white rounded-[28px] p-8 shadow-soft text-center space-y-6 border border-[#F1E9DC]">
              <div className="w-16 h-16 rounded-full bg-[#CDEBDD] text-[#0F3D33] flex items-center justify-center mx-auto shadow-sm">
                <Server className="w-8 h-8 animate-pulse text-[#0F3D33]" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-semibold text-[#0F3D33]">
                  Waking up the server
                </h3>
                <p className="text-sm text-[#527A71] leading-relaxed">
                  The demo engine is spinning up on cloud infrastructure. This can take up to a minute on first visit.
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="h-2 w-full bg-[#F1E9DC] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#0F3D33] rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'easeInOut' }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#527A71]">
                  <span>Connecting...</span>
                  <span>Almost ready</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
};

