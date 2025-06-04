/**
 * @class Clase para personaje
 */

class Character {
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

  isAlive() {
    return this.status === "Alive";
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
           <span>${this.status} - ${this.species}</span>       
           <div>
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
class Episode {
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

  render() {
    return `<div class="episode-card ">
        <h3 class="episode-name">${this.id}. ${this.name}</h3>
        <p class="episode-date">${this.air_date}</p>
        <p class="episode-code">${this.episode}</p>
      </div>`;
  }
}

/**
 * @class Clase para consumir API
 */

class ApiService {
  constructor() {}
  URLCharacters = "https://rickandmortyapi.com/api/character";
  URLEpisodes = "https://rickandmortyapi.com/api/episode";

  async getData(type, url = null, params = {}) {
    switch (type) {
      case "personajes":
        return this.#getAllCharacters(url || this.URLCharacters, params);
      case "episodios":
        return this.#getAllEpisodes(url || this.URLEpisodes);
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

  async #getAllEpisodes(url) {
    try {
      const response = await fetch(url);
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

const apiService = new ApiService();
let currentFilters = {
  status: "",
  name: "",
};
let currentPageUrl = apiService.URLCharacters;
let currentPageUrlEpisodes = apiService.URLEpisodes;
let prevPageUrl = null;
let nextPageUrl = null;
let totalPages = 1;
let currentPageNumber = 1;
let nameCharacter = null;

const articleElement = document.querySelector("article");
const prevBtn = document.getElementById("PrevBtn");
const nextBtn = document.getElementById("NextBtn");
const statusFilterSelect = document.getElementById("statusFilter");
const pageInfoLi = document.getElementById("Number");
const nameSearchInput = document.getElementById("searchName");
const episodesSelect = document.getElementById("episodes");

function renderEpisodes(episodes) {
  articleElement.innerHTML = "";
  if (episodes && episodes.length > 0) {
    episodes.forEach((episode) => {
      const sectionEpisode = document
        .createRange()
        .createContextualFragment(episode.render());
      articleElement.append(sectionEpisode);
    });
  } else {
    articleElement.innerHTML = "<p>No se encontraron episodios.</p>";
  }
}
/**
 *
 * @param {Character[]} characters Array de objetos Character.
 */
function renderCharacters(characters) {
  articleElement.innerHTML = "";

  if (characters && characters.length > 0) {
    characters.forEach((character) => {
      const sectionCharacter = document
        .createRange()
        .createContextualFragment(character.render());
      articleElement.append(sectionCharacter);
    });
  } else {
    articleElement.innerHTML = "<p>No se encontraron personajes.</p>";
  }
}

function getPageNumberFromUrl(url) {
  if (!url) return null;
  const urlObj = new URL(url);
  const urlParams = new URLSearchParams(urlObj.search);
  return parseInt(urlParams.get("page")) || 1;
}

async function loadEpisodes(url) {
  const data = await apiService.getData("episodios", url);
  renderEpisodes(data.results);
}

/**
 *
 * @param {string} url La URL de la página de personajes a cargar.
 */
async function loadCharacters(url, resetPage = false) {
  let fetchUrl = url;
  if (resetPage) {
    const baseUrl = new URL(apiService.URLCharacters);
    for (const key in currentFilters) {
      if (currentFilters[key]) {
        baseUrl.searchParams.set(key, currentFilters[key]);
      }
    }
    fetchUrl = baseUrl.toString();
  }

  const data = await apiService.getData("personajes", fetchUrl, currentFilters);

  prevPageUrl = data.info.prev;
  nextPageUrl = data.info.next;
  totalPages = data.info.pages;
  nameCharacter = data.results.name;

  if (prevPageUrl === null) {
    currentPageNumber = 1;
  } else if (nextPageUrl === null) {
    currentPageNumber = totalPages;
  } else {
    currentPageNumber = getPageNumberFromUrl(prevPageUrl) + 1;
  }
  if (totalPages === 0) currentPageNumber = 0;
  else if (totalPages === 1 && prevPageUrl === null && nextPageUrl === null)
    currentPageNumber = 1;

  renderCharacters(data.results);
  setupPaginationButtons();
}

function setupPaginationButtons() {
  if (prevPageUrl) {
    prevBtn.classList.remove("disabled");
    prevBtn.removeAttribute("tabindex");
  } else {
    prevBtn.classList.add("disabled");
    prevBtn.setAttribute("tabindex", "-1");
  }

  pageInfoLi.textContent = `Página ${currentPageNumber} de ${totalPages}`;

  if (nextPageUrl) {
    nextBtn.classList.remove("disabled");
    nextBtn.removeAttribute("tabindex");
  } else {
    nextBtn.classList.add("disabled");
    nextBtn.setAttribute("tabindex", "-1");
  }
}

prevBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (prevPageUrl) {
    currentPageUrl = prevPageUrl;
    loadCharacters(currentPageUrl);
  }
});

nextBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (nextPageUrl) {
    currentPageUrl = nextPageUrl;
    loadCharacters(currentPageUrl);
  }
});
document.addEventListener("DOMContentLoaded", () => {
  loadCharacters(currentPageUrl);
});

episodesSelect.addEventListener("click", () => {
  loadEpisodes(currentPageUrlEpisodes);
});

statusFilterSelect.addEventListener("change", () => {
  currentFilters.status = statusFilterSelect.value;
  currentPageUrl = apiService.URLCharacters;
  loadCharacters(currentPageUrl, true);
});

nameSearchInput.addEventListener("keypress", (e) => {
  currentFilters.name = nameSearchInput.value.trim();
  currentPageUrl = apiService.URLCharacters;
  loadCharacters(currentPageUrl, true);
  if (e.key === "Enter") {
    searchButton.click();
  }
});

const navBar = document.querySelector("nav"),
  menuBtns = document.querySelectorAll(".menu-icon"),
  overlay = document.querySelector(".overlay");
menuBtns.forEach((menuBtn) => {
  menuBtn.addEventListener("click", () => {
    navBar.classList.toggle("open");
  });
});
overlay.addEventListener("click", () => {
  navBar.classList.remove("open");
});
