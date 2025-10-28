// src/components/samples/Filters.tsx
import { useState } from "react";
import { Input } from "@/components/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/components/ui/select";

interface FiltersProps {
  onChange: (params: Record<string, string>) => void;
}

export default function Filters({ onChange }: FiltersProps) {
  const [search, setSearch] = useState("");
  const [key, setKey] = useState("");

  function applyFilters() {
    onChange({ q: search, key });
  }

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Input
        placeholder="search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-64 bg-zinc-900 border-zinc-800 text-zinc-100"
      />
      <Select onValueChange={setKey}>
        <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-zinc-100">
          <SelectValue placeholder="Key" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 text-zinc-100">
          {["A Minor", "B Minor", "C Minor", "D Minor", "E Minor", "F Minor", "G Minor", "A Major", "B Major", "C Major"].map(
            (k) => (
              <SelectItem key={k} value={k}>
                {k}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>

      <button
        onClick={applyFilters}
        className="px-4 py-2 border border-zinc-700 hover:bg-zinc-800 rounded-md text-sm"
      >
        apply
      </button>
    </div>
  );
}