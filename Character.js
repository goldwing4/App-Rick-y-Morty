import { ApiService } from "./Classes.js";

const apiService = new ApiService();

export let currentPageUrl = apiService.URLCharacters;

export async function getCharactersHtml(url, filters = {}) {
  const data = await apiService.getData("personajes", url, filters);

  let charactersHtml = "";
  if (data.results && data.results.length > 0) {
    data.results.forEach((character) => {
      charactersHtml += character.render();
    });
  } else {
    charactersHtml = "<p>No se encontraron personajes.</p>";
  }

  return {
    html: charactersHtml,
    info: data.info,
    rawCharactersData: data.results,
  };
}

export function getPageNumberFromUrl(url) {
  if (!url) return null;
  const urlObj = new URL(url);
  const urlParams = new URLSearchParams(urlObj.search);
  return parseInt(urlParams.get("page")) || 1;
}
