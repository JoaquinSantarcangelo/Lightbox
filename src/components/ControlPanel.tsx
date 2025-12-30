'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useLightingStore } from '@/hooks/useLightingStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorControls } from './ColorControls';
import { EffectControls } from './EffectControls';
import { ClockControls } from './ClockControls';

export function ControlPanel() {
  const panelVisible = useLightingStore((s) => s.panelVisible);
  const clockSource = useLightingStore((s) => s.clockSource);
  const audioMode = useLightingStore((s) => s.audioMode);

  return (
    <AnimatePresence>
      {panelVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[400px] max-w-[calc(100vw-2rem)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-stone-950/80 backdrop-blur-xl rounded-2xl border border-stone-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-stone-800/50 flex items-center justify-between">
              <h1 className="text-sm font-semibold text-stone-200 tracking-wide">
                LIGHTBOX
              </h1>
              {clockSource !== 'off' && (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-medium text-green-400 uppercase">
                    {clockSource === 'audio' ? audioMode : clockSource}
                  </span>
                </div>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="color" className="p-4">
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="color">Color</TabsTrigger>
                <TabsTrigger value="effects">Effects</TabsTrigger>
                <TabsTrigger value="clock">Clock</TabsTrigger>
              </TabsList>

              <TabsContent value="color">
                <ColorControls />
              </TabsContent>

              <TabsContent value="effects">
                <EffectControls />
              </TabsContent>

              <TabsContent value="clock">
                <ClockControls />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
