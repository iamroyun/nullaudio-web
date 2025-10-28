// src/components/samples/PlayerGrid.tsx
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/components/ui/card";
import { Badge } from "@/components/components/ui/badge";
import { Button } from "@/components/components/ui/button";
import gsap from "gsap";
import WaveSurfer from "wavesurfer.js";

interface Sample {
  title: string;
  bpm?: number;
  key?: string;
  lengthSec?: number;
  isFree: boolean;
  previewUrl?: string;
  waveformPngUrl?: string;
  waveformPeaksUrl?: string;
  packTitle?: string;
  artist?: { name?: string };
}

interface PlayerGridProps {
  samples: Sample[];
  loading: boolean;
}

export default function PlayerGrid({ samples, loading }: PlayerGridProps) {
  const [current, setCurrent] = useState<number | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!loading && samples.length) {
      gsap.fromTo(
        ".sample-card",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.6, ease: "power1.out" }
      );
    }
  }, [samples, loading]);

  function togglePlay(i: number, s: Sample) {
    // Stop previous
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
      setCurrent(null);
    }

    // Start new
    if (current !== i && s.previewUrl) {
      const container = document.getElementById(`waveform-${i}`);
      if (!container) return;
      fetch(s.waveformPeaksUrl!)
        .then((r) => r.json())
        .then((peaks) => {
          const ws = WaveSurfer.create({
            container,
            waveColor: "#C1A8FF",
            progressColor: "#fff",
            cursorWidth: 0,
            height: 60,
            barWidth: 2,
            barGap: 1,
            peaks,
          });
          ws.load(s.previewUrl!);
          ws.on("ready", () => ws.play());
          ws.on("finish", () => {
            ws.destroy();
            setCurrent(null);
          });
          wavesurferRef.current = ws;
          setCurrent(i);
        });
    }
  }

  if (loading) return <p className="text-zinc-500">loading samples...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {samples.map((s, i) => (
        <Card
          key={i}
          className="sample-card bg-zinc-950 border border-zinc-800 p-4 rounded-2xl shadow-soft flex flex-col gap-2"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-zinc-100 text-lg">{s.title}</h3>
              <p className="text-zinc-500 text-sm">
                {s.key} · {s.bpm} BPM · {s.lengthSec}s
              </p>
            </div>
            <Badge variant={s.isFree ? "outline" : "secondary"}>
              {s.isFree ? "free" : "locked"}
            </Badge>
          </div>

          <div id={`waveform-${i}`} className="h-[60px] overflow-hidden">
            {s.waveformPngUrl && (
              <img
                src={s.waveformPngUrl}
                alt=""
                className={`w-full h-[60px] object-cover opacity-80 ${
                  current === i ? "hidden" : ""
                }`}
              />
            )}
          </div>

          <div className="flex justify-between items-center mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePlay(i, s)}
              className="text-accent-lavender"
            >
              {current === i ? "pause" : "play"}
            </Button>

            <Button
              variant={s.isFree ? "outline" : "ghost"}
              size="sm"
              disabled={!s.isFree}
            >
              download
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}