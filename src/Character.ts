import { ApiService, Character } from "./Classes";
import { Filters, Info, ApiCharacter, ApiResponse} from "./types";

const apiService = new ApiService();

export let currentPageUrl = apiService.URLCharacters;

export async function getCharactersHtml(url: string, filters: Filters): Promise<{ html: string; info: Info; rawCharactersData: Character[]}> 
{
  const data: ApiResponse = await apiService.getData("personajes", url, filters);

  let charactersHtml = "";
  if (data.results && data.results.length > 0) {
    data.results.forEach((character: Character) =>  {
      charactersHtml += character.render()
    });
  } else {
    charactersHtml = "<p>No se encontraron personajes.</p>";
  }

  return {
    html: charactersHtml,
    info: data.info,
    rawCharactersData: data.results || null,
  };
}

export function getPageNumberFromUrl(url: string): number{
  const urlObj = new URL(url);
  const urlParams = new URLSearchParams(urlObj.search);
  const pageParam = urlParams.get("page")
  if (pageParam === null){
  return 1
  }
  const pageNumber = parseInt(pageParam)
  return pageNumber
}
