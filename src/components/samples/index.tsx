// src/components/samples/index.tsx
import { useEffect, useState } from "react";
import PlayerGrid from "./PlayerGrid";
import Filters from "./Filters";

export default function SamplePlayer() {
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);

  async function loadSamples(extra?: Record<string, string>) {
    setLoading(true);
    const params = new URLSearchParams({
      start: String(page * 12),
      end: String(page * 12 + 12),
      ...extra,
    });
    const res = await fetch(`/api/samples?${params.toString()}`);
    const data = await res.json();
    setSamples(data);
    setLoading(false);
  }

  useEffect(() => {
    loadSamples();
  }, []);

  return (
    <div className="space-y-8">
      <Filters onChange={loadSamples} />
      <PlayerGrid samples={samples} loading={loading} />
      <div className="text-center">
        <button
          className="px-4 py-2 text-sm border border-zinc-700 hover:bg-zinc-800 rounded-md"
          onClick={() => {
            setPage((p) => p + 1);
            loadSamples({ start: String((page + 1) * 12), end: String((page + 1) * 12 + 12) });
          }}
        >
          load more
        </button>
      </div>
    </div>
  );
}
