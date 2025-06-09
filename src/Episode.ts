import { ApiService, Episode } from "./Classes";
import { Filters, Info, ApiResponse, ApiEpisode } from "./types";

const apiService = new ApiService();

export let currentPageUrlEpisodes = apiService.URLEpisodes;

export async function getEpisodesHtml(url: string, filters: Filters): Promise<{ html: string; info: Info; rawEpisodesData: Episode[]}> {
  const data: ApiResponse = await apiService.getData("episodios", url, filters);

  let episodesHtml = "";
  if (data.results && data.results.length > 0) {
    episodesHtml = data.results.map((episode: Episode) => episode.render()).join("");
  } else {
    episodesHtml = "<p>No se encontraron episodios.</p>";
  }

  return {
    html: episodesHtml,
    info: data.info,
    rawEpisodesData: data.results || null,
  };
}

export function getPageNumberFromUrlEpisodes(url: string ): number{
  const urlObj = new URL(url);
  const urlParams = new URLSearchParams(urlObj.search);
  const pageParam = urlParams.get("page")
  if (pageParam === null){
  return 1
  }
  const pageNumber = parseInt(pageParam)
  return pageNumber
}
