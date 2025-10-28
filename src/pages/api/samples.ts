import type { APIRoute } from "astro";
import { sanityClient } from "@/lib/sanity";
import { buildSamplesQuery } from "@/lib/samplesQuery";

export const GET: APIRoute = async ({ url }) => {
  const params = Object.fromEntries(url.searchParams.entries());
  const start = Number(params.start || 0);
  const end = Number(params.end || 12);
  const query = buildSamplesQuery({ ...params, start, end });

  const packs = await sanityClient.fetch(query);

  // flatten nested samples
  const samples = packs.flatMap((pack: any) =>
    pack.samples.map((s: any) => ({
      ...s,
      packSlug: pack.packSlug,
      packTitle: pack.packTitle,
      artist: pack.artist,
    }))
  );

  return new Response(JSON.stringify(samples), {
    headers: { "content-type": "application/json" },
  });
};