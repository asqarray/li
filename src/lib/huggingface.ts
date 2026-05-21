import { HFDatasetData } from "../types";

export async function fetchHFDatasetData(url: string): Promise<HFDatasetData> {
  const cleanUrl = url.replace(/\/+$/, "");
  const match = cleanUrl.match(/huggingface\.co\/datasets\/([^/?#]+)\/([^/?#]+)/);
  if (!match) throw new Error("Invalid Hugging Face Dataset URL. Expected format: https://huggingface.co/datasets/owner/name");

  const datasetId = `${match[1]}/${match[2]}`;
  const baseUrl = `https://huggingface.co/api/datasets/${datasetId}`;

  const res = await fetch(baseUrl);
  if (!res.ok) throw new Error(`Hugging Face API Error: ${res.statusText}`);
  
  const data = await res.json();

  return {
    id: data.id,
    author: data.author,
    description: data.description || "",
    tags: data.tags || [],
    lastModified: data.lastModified,
    downloads: data.downloads,
    likes: data.likes,
    paperswithcode_id: data.paperswithcode_id
  };
}

export async function searchHFDatasets(query: string): Promise<HFDatasetData[]> {
  const url = `https://huggingface.co/api/datasets?search=${encodeURIComponent(query)}&sort=downloads&direction=-1&limit=5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Hugging Face Search Error: ${res.statusText}`);
  const results = await res.json();
  
  return results.map((d: any) => ({
    id: d.id,
    author: d.author,
    description: d.description || "",
    tags: d.tags || [],
    lastModified: d.lastModified,
    downloads: d.downloads,
    likes: d.likes,
  }));
}
