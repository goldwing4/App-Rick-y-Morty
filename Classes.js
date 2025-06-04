/**
 * @class Clase para personaje
 */

export class Character {
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
  constructor(id, name, status, species, gender, image, origin, location) {
    this.id = id;
    this.name = name;
    this.status = status;
    this.species = species;
    this.gender = gender;
    this.image = image;
    this.origin = origin;
    this.location = location;
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
    return `
      <div class="img-container">
             <img
               src="${this.image}"
               alt="${this.name}"
             />
             <h2>${this.name}</h2>
           <span class ="info"><span class = "${this.statusCharacter()}"></span> ${
      this.status
    } - ${this.species}</span>       
           <div>
            <span class = "${this.genderCharacter()}"></span>
            <span class="gender">${this.gender}</span>
             <span class="fa-solid fa-house" style="justify-self: center;"></span>
             <span> ${this.getOriginName()}</span>
             <span class="fa-solid fa-location-dot" style="justify-self: center;"></span>
             <span>${this.getLocationName()}</span>
           </div>
           </div>
    `;
  }
}
/**
 * @class Clase para episodios
 */
export class Episode {
  /**
   *
   * @param {int} id Id de episodio
   * @param {string} name nombre del episodio
   * @param {string} air_date fecha de emision
   * @param {string} episode numero de episodio
   * @param {object} characters personajes en el episodio
   */
  constructor(id, name, air_date, episode, characters) {
    this.id = id;
    this.name = name;
    this.air_date = air_date;
    this.episode = episode;
    this.characters = characters;
  }

  async render() {
    let characterNamesHtml = '<div class="episode-characters-list">';
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

        const names = actualCharacters.map((char) => char.name);
        characterNamesHtml += `<p><strong>Personajes:</strong> ${names.join(
          ", "
        )}</p>`;
      } catch (error) {
        console.error(
          `Error al obtener personajes para el episodio ${this.name}:`,
          error
        );
        characterNamesHtml += `<p>Personajes: No se pudieron cargar.</p>`;
      }
    } else {
      characterNamesHtml += `<p>Personajes: Ninguno conocido.</p>`;
    }
    characterNamesHtml += "</div>";

    return `<div class="episode-card">
        <h3 class="episode-name">${this.id}. ${this.name}</h3>
        <p class="episode-date">${this.air_date}</p>
        <p class="episode-code">${this.episode}</p>
        ${characterNamesHtml}
      </div>`;
  }
}

/**
 * @class Clase para consumir API
 */

export class ApiService {
  constructor() {}
  URLCharacters = "https://rickandmortyapi.com/api/character";
  URLEpisodes = "https://rickandmortyapi.com/api/episode";

  async getData(type, url = null, params = {}) {
    switch (type) {
      case "personajes":
        return this.#getAllCharacters(url || this.URLCharacters, params);
      case "episodios":
        return this.#getAllEpisodes(url || this.URLEpisodes, params);
      default:
        throw new Error("Tipo de datos no soportado.");
    }
  }

  /**
   *
   * @param {url} url La url de los personajes
   * @param {*} params Los parametros para filtrar
   * @returns Una promesa con los datos del personaje
   */

  async #getAllCharacters(url, params) {
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
      const charactersData = await response.json();

      const characters = charactersData.results.map(
        (charData) =>
          new Character(
            charData.id,
            charData.name,
            charData.status,
            charData.species,
            charData.gender,
            charData.image,
            charData.origin,
            charData.location
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

  async #getAllEpisodes(url, params) {
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
      const episodesData = await response.json();
      const episodes = episodesData.results.map(
        (episodeData) =>
          new Episode(
            episodeData.id,
            episodeData.name,
            episodeData.air_date,
            episodeData.episode,
            episodeData.characters
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
