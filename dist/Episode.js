import { ApiService } from "./Classes.js";
const apiService = new ApiService();
export let currentPageUrlEpisodes = apiService.URLEpisodes;
export async function getEpisodesHtml(url, filters) {
    const data = await apiService.getData("episodios", url, filters);
    let episodesHtml = "";
    if (data.results && data.results.length > 0) {
        episodesHtml = data.results.map((episode) => episode.render()).join("");
    }
    else {
        episodesHtml = "<p>No se encontraron episodios.</p>";
    }
    return {
        html: episodesHtml,
        info: data.info,
        rawEpisodesData: data.results || null,
    };
}
export function getPageNumberFromUrlEpisodes(url) {
    const urlObj = new URL(url);
    const urlParams = new URLSearchParams(urlObj.search);
    const pageParam = urlParams.get("page");
    if (pageParam === null) {
        return 1;
    }
    const pageNumber = parseInt(pageParam);
    return pageNumber;
}
