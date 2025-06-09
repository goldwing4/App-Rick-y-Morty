const favoriteCharactersKey = "favoriteCharacters";
const favoriteEpisodesKey = "favoriteEpisodes";

export let favoriteCharacters: Set<number> = new Set();
export let favoriteEpisodes: Set<number> = new Set();

/**
 * Carga los favoritos al localstorage
 */
export function loadFavorites() : void{
  const storedCharacters = localStorage.getItem(favoriteCharactersKey);
  if (storedCharacters) {
    favoriteCharacters = new Set(JSON.parse(storedCharacters));
  }

  const storedEpisodes = localStorage.getItem(favoriteEpisodesKey);
  if (storedEpisodes) {
    favoriteEpisodes = new Set(JSON.parse(storedEpisodes));
  }
}
/**
 * Guarda los favoritos cargados al localstorage
 */

function saveFavorites(): void {
  localStorage.setItem(
    favoriteCharactersKey,
    JSON.stringify(Array.from(favoriteCharacters))
  );
  localStorage.setItem(
    favoriteEpisodesKey,
    JSON.stringify(Array.from(favoriteEpisodes))
  );
  console.log("favoritos guardados: ", {
    characters: favoriteCharacters,
    episodes: favoriteEpisodes,
  });
}
/**
 * Elimina o añade un item de favoritos
 * @param {int} id ID del personaje o episodio
 * @param {*} type
 * @returns
 */

export function itemFavorites(id: number, type: string): void {
  let collection: Set<number>;
  let key: string;

  if (type === "character") {
    collection = favoriteCharacters;
    key = favoriteCharactersKey;
  } else if (type === "episode") {
    collection = favoriteEpisodes;
    key = favoriteEpisodesKey;
  } else {
    console.log("Tipo de dato no identificado: ", type);
    return;
  }

  if (collection.has(id)) {
    collection.delete(id);
    console.log(`Eliminado ${type} con ID ${id} de favoritos`);
  } else {
    collection.add(id);
    console.log(`Añadido ${type} con ID ${id} de favoritos`);
  }
  saveFavorites();
}

/**
 * Verifica si mi item es favorito
 * @param {*} id
 * @param {*} type
 * @returns
 */

export function isFavorite(id: number, type: string): boolean {
  if (type === "character") {
    return favoriteCharacters.has(id);
  } else if (type === "episode") {
    return favoriteEpisodes.has(id);
  }
  return false;
}
