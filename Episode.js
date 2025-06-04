import { Episode, ApiService } from "./Classes.js";

const apiService = new ApiService();

export let currentPageUrlEpisodes = apiService.URLEpisodes;

export async function getEpisodesHtml(url, filters = {}) {
  const data = await apiService.getData("episodios", url, filters);

  let episodesHtml = "";
  if (data.results && data.results.length > 0) {
    const episodePromises = data.results.map(async (episodeData) => {
      const episodeInstance = new Episode(
        episodeData.id,
        episodeData.name,
        episodeData.air_date,
        episodeData.episode,
        episodeData.characters
      );
      return await episodeInstance.render();
    });

    const renderedEpisodes = await Promise.all(episodePromises);
    episodesHtml = renderedEpisodes.join("");
  } else {
    episodesHtml = "<p>No se encontraron episodios.</p>";
  }
  return {
    html: episodesHtml,
    info: data.info,
  };
}

export function getPageNumberFromUrlEpisodes(url) {
  if (!url) return null;
  const urlObj = new URL(url);
  const urlParams = new URLSearchParams(urlObj.search);
  return parseInt(urlParams.get("page")) || 1;
}
