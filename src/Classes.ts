import { isFavorite } from "./localStorage";
import { type ApiCharacter, ApiEpisode, Location, ApiResponse, Filters } from "./types";

/**
 * @class Clase para personaje
 */

export class Character implements ApiCharacter {
  /**
   *
   * @param {int} id Identficador de personaje
   * @param {string} name Nombre
   * @param {string} status Estado de vida
   * @param {string} species Especie
   * @param {string} gender Genero
   * @param {string} image Imagen
   * @param {object} origin Lugar de origen
   * @param {object} location Localizacion
   */
  id: number
  name: string
  status: string
  species: string
  gender: string
  image: string;
  origin: Location;
  location: Location;
  episode: string[];


  constructor(
        id:       number,
        name:     string,
        status:   string,
        species:  string,
        gender:   string,
        image:    string,
        origin:   Location,
        location: Location,
        episode:  string[],

  ) {
    this.id = id;
    this.name = name;
    this.status = status;
    this.species = species;
    this.gender = gender;
    this.image = image;
    this.origin = origin
    this.location = location;
    this.episode = episode;

  }

  statusCharacter() {
    let iconStatus = "";

    if (this.status === "Alive") {
      iconStatus = "fa-solid fa-face-smile";
    } else if (this.status === "Dead") {
      iconStatus = "fas fa-skull-crossbones";
    } else if (this.status === "unknown") {
      iconStatus = "fas fa-question-circle";
    }
    return iconStatus;
  }

  genderCharacter() {
    let iconGender = "";

    if (this.gender === "Male") {
      iconGender = "fa-solid fa-mars";
    } else if (this.gender === "Female") {
      iconGender = "fa-solid fa-venus";
    } else {
      iconGender = "fa-solid fa-genderless";
    }
    return iconGender;
  }

  getOriginName() {
    return this.origin ? this.origin.name : "Desconocido";
  }

  getLocationName() {
    return this.location ? this.location.name : "Desconocido";
  }

  render() {
    const isCharFavorite = isFavorite(this.id, "character");
    return `
      <div class="img-container" data-character-id="${this.id}">
             <img
               src="${this.image}"
               alt="${this.name}"
             />
             <h2>${this.name}</h2>
            
           <div>
           <span class = "${this.statusCharacter()}"></span>
           <span> ${this.status} - ${this.species}</span>      
            <span class = "${this.genderCharacter()}"></span>
            <span class="gender">${this.gender}</span>
             <span class="fa-solid fa-house" style="justify-self: center;"></span>
             <span> ${this.getOriginName()}</span>
             <span class="fa-solid fa-location-dot" style="justify-self: center;"></span>
             <span>${this.getLocationName()}</span>
           </div>
           <button class="favorite ${isCharFavorite ? "active" : ""}"></button>
           </div>
    `;
  }

  async getModalContent() {
    let episodesHtml = "<p>Cargando episodios...</p>";
    if (this.episode && this.episode.length > 0) {
      try {
        const episodeIds = this.episode.map((url) => url.split("/").pop());
        const episodesResponse = await fetch(
          `https://rickandmortyapi.com/api/episode/${episodeIds.join(",")}`
        );
        const episodesData = await episodesResponse.json();

        const actualEpisodes = Array.isArray(episodesData)
          ? episodesData
          : [episodesData];
        const episodeNames = actualEpisodes.map(
          (ep) => `${ep.episode} - ${ep.name}`
        ); // Formato S01E01 - Nombre
        episodesHtml = `<p><strong>Aparece en:</strong></p><ul>${episodeNames
          .map((name) => `<li>${name}</li>`)
          .join("")}</ul>`;
      } catch (error) {
        console.error(
          `Error al obtener episodios para el personaje ${this.name}:`,
          error
        );
        episodesHtml = `<p>Episodios: No se pudieron cargar.</p>`;
      }
    } else {
      episodesHtml = `<p>No hay episodios asociados.</p>`;
    }

    return `
      <div class="modal-content-character">
        <img src="${this.image}" alt="${
      this.name
    }" class="modal-character-image-large">
        <h3>${this.name}</h3>
        <p><strong>Estado:</strong> ${this.status}</p>
        <p><strong>Especie:</strong> ${this.species}</p>
        <p><strong>Género:</strong> ${this.gender}</p>
        <p><strong>Origen:</strong> ${this.getOriginName()}</p>
        <p><strong>Localización:</strong> ${this.getLocationName()}</p>
        ${episodesHtml}
      </div>
    `;
  }
}
/**
 * @class Clase para episodios
 */
export class Episode implements ApiEpisode {
  /**
   *
   * @param {int} id Id de episodio
   * @param {string} name nombre del episodio
   * @param {string} air_date fecha de emision
   * @param {string} episode numero de episodio
   * @param {object} characters personajes en el episodio
   */
  id: number
  name: string
  air_date: string
  episode: string
  characters: string[];


  constructor(id: number, name: string, air_date: string, episode: string, characters: string[]) {
    this.id = id;
    this.name = name;
    this.air_date = air_date;
    this.episode = episode;
    this.characters = characters;
  }

  render() {
    const isEpFavorite = isFavorite(this.id, "episode");
    return `<div class="episode-card" data-episode-id ="${this.id}">
        <h3 class="episode-name">${this.id}. ${this.name}</h3>
        <p class="episode-date">${this.air_date}</p>
        <p class="episode-code">${this.episode}</p>
        <button class="favorite ${isEpFavorite ? "active" : ""}"></button>
      </div>`;
  }

  async getModalContent() {
    let charactersHtml = "<p>Cargando personajes...</p>";
    if (this.characters && this.characters.length > 0) {
      try {
        const characterIds = this.characters.map((url) => url.split("/").pop());
        const charactersResponse = await fetch(
          `https://rickandmortyapi.com/api/character/${characterIds.join(",")}`
        );
        const charactersData = await charactersResponse.json();

        const actualCharacters = Array.isArray(charactersData)
          ? charactersData
          : [charactersData];

        charactersHtml = `<div class="modal-characters-grid">`;
        if (actualCharacters.length > 0) {
          charactersHtml += actualCharacters
            .map(
              (charData) => `
            <div class="modal-character-item">
              <img src="${charData.image}" alt="${charData.name}" class="modal-character-image">
              <p class="modal-character-name">${charData.name}</p>
              <p class="modal-character-status">${charData.status}</p>
            </div>
          `
            )
            .join("");
        } else {
          charactersHtml += `<p>No hay personajes para este episodio.</p>`;
        }
        charactersHtml += `</div>`;
      } catch (error) {
        console.error(
          `Error al obtener personajes para el episodio ${this.name}:`,
          error
        );
        charactersHtml = `<p>Personajes: No se pudieron cargar.</p>`;
      }
    } else {
      charactersHtml = `<p>No hay personajes asociados a este episodio.</p>`;
    }

    return `
      <div class="modal-content-episode">
        <h3>${this.name}</h3>
        <p><strong>Fecha de Emisión:</strong> ${this.air_date}</p>
        <p><strong>Número de Episodio:</strong> ${this.episode}</p>
        <h4>Personajes:</h4>
        ${charactersHtml}
      </div>
    `;
  }
}

/**
 * @class Clase para consumir API
 */

export class ApiService {
  constructor() {}
  URLCharacters = "https://rickandmortyapi.com/api/character";
  URLEpisodes = "https://rickandmortyapi.com/api/episode";

  async getData(type: string, url: null | string, params: Filters) {
    switch (type) {
      case "personajes":
        return this.#getAllCharacters(url || this.URLCharacters, params);
      case "episodios":
        return this.#getAllEpisodes(url || this.URLEpisodes, params);
      default:
        throw new Error("Tipo de datos no soportado.");
    }
  }

  async getByIds(type: string, idsArray: number[]) {
    if (!idsArray || idsArray.length === 0) {
      return [];
    }

    const idsUrl = idsArray.join(",");
    let apiUrl;
    let ClassConstructor;

    if (type === "character") {
      apiUrl = `${this.URLCharacters}/${idsUrl}`;
      ClassConstructor = Character;
    } else if (type === "episode") {
      apiUrl = `${this.URLEpisodes}/${idsUrl}`;
      ClassConstructor = Episode;
    } else {
      console.log("Tipo de dato desconocido para getByIds: ", type);
      return [];
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        if (response.status === 404 && idsArray.length === 1) {
          console.warn(`Item con ID ${idsArray[0]} no encontrado.`);
          return [];
        }
        throw new Error(
          `Error HTTP: ${response.status} al obtener ${type}s por IDs.`
        );
      }

      const data: (ApiCharacter | ApiEpisode ) = await response.json();

      const itemsData = Array.isArray(data) ? data : [data];

      const instances = itemsData.map((itemData) => {
        if (type === "character") {
          return new ClassConstructor(
            itemData.id,
            itemData.name,
            itemData.status,
            itemData.species,
            itemData.gender,
            itemData.image,
            itemData.origin,
            itemData.location,
            itemData.episode,
          );
        } else {
          return new Episode(
            itemData.id,
            itemData.name,
            itemData.air_date,
            itemData.episode,
            itemData.characters
          );
        }
      });
      return instances;
    } catch (error) {
      console.error(`Error al obtener ${type}s por IDs:`, error);
      return [];
    }
  }

  /**
   *
   * @param {url} url La url de los personajes
   * @param {*} params Los parametros para filtrar
   * @returns Una promesa con los datos del personaje
   */

  async #getAllCharacters(url: string, params: Filters) {
    try {
      const urlObj = new URL(url);
      for (const key in params) {
        if (params[key]) {
          urlObj.searchParams.set(key, params[key]);
        }
      }
      const response = await fetch(urlObj.toString());
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const charactersData: ApiResponse = await response.json();

      const characters: Character[] = charactersData.results.map(
        (charData) =>
          new Character(
            charData.id,
            charData.name,
            charData.status,
            charData.species,
            charData.gender,
            charData.image,
            charData.origin,
            charData.location,
            charData.episode,
          )
      );
      return { info: charactersData.info, results: characters };
    } catch (error) {
      console.error("Error al obtener los personajes: ", error);
      return {
        info: {
          count: 0,
          pages: 0,
          next: null,
          prev: null,
        },
        results: [],
      };
    }
  }

  /**
   *
   * @param {*} url
   * @returns Una promesa con los datos del episodio
   */

  async #getAllEpisodes(url: string, params: Filters) {
    try {
      const urlObj = new URL(url);
      for (const key in params) {
        if (params[key]) {
          urlObj.searchParams.set(key, params[key]);
        }
      }
      const response = await fetch(urlObj.toString());
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const episodesData: ApiResponse = await response.json();
      const episodes = episodesData.results.map(
        (episodeData) =>
          new Episode(
            episodeData.id,
            episodeData.name,
            episodeData.air_date,
            episodeData.episode,
            episodeData.characters,
          )
      );
      return { info: episodesData.info, results: episodes };
    } catch (error) {
      console.error("Error al obtener episodios: ", error);
      return {
        info: {
          count: 0,
          pages: 0,
          next: null,
          prev: null,
        },
        results: [],
      };
    }
  }
}
