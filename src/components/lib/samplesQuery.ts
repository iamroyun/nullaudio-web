export function buildSamplesQuery({
    start = 0,
    end = 12,
    q,
    key,
    instrumentSlug,
    formatSlug,
    artistSlug,
    packSlug,
    onlyFree,
    order = "newest",
  }: any) {
    const filters: string[] = ["_type == 'samplePack'", "count(samples[]) > 0"];
    const innerFilters: string[] = [];
  
    if (q) innerFilters.push(`title match "${q}*"`);
    if (key) innerFilters.push(`key == "${key}"`);
    if (onlyFree) innerFilters.push(`isFree == true`);
    if (instrumentSlug)
      innerFilters.push(`"${instrumentSlug}" in instruments[]->slug.current`);
    if (formatSlug)
      innerFilters.push(`"${formatSlug}" in formats[]->slug.current`);
    if (artistSlug)
      innerFilters.push(`"${artistSlug}" in createdByArtists[]->slug.current`);
    if (packSlug) filters.push(`slug.current == "${packSlug}"`);
  
    const orderExpr =
      order === "bpm-asc"
        ? "samples[].bpm asc"
        : order === "bpm-desc"
        ? "samples[].bpm desc"
        : "_createdAt desc";
  
    return `
      *[${filters.join(" && ")}] | order(${orderExpr})[${start}...${end}]{
        title,
        slug,
        "packSlug": slug.current,
        "packTitle": title,
        "artist": createdByArtists[0]->{name, slug},
        samples[]{
          title,
          slug,
          bpm,
          key,
          lengthSec,
          isFree,
          previewUrl,
          "waveformPngUrl": waveformPngUrl,
          "waveformPeaksUrl": waveformPeaksUrl,
          "r2Key": r2Key
        }
      }
    `;
  }