import {
  getCharactersHtml,
  getPageNumberFromUrl as getCharPageNumber,
} from "./Character";

import {
  getEpisodesHtml,
  getPageNumberFromUrlEpisodes as getEpisodePageNumber,
} from "./Episode";

import { ApiService,Episode,Character } from "./Classes";
import {
  loadFavorites,
  itemFavorites,
  isFavorite,
  favoriteCharacters,
  favoriteEpisodes,
} from "./localStorage";

import { Filters,DataCardElement } from "./types";

//Variables para el DOM
const episodesSelect = document.getElementById("episodes") as HTMLAnchorElement;
const charactersButton = document.getElementById("character") as HTMLAnchorElement;
const mainContentContainer = document.querySelector("article") as HTMLDivElement;
const prevBtn = document.getElementById("PrevBtn") as HTMLButtonElement;
const nextBtn = document.getElementById("NextBtn") as HTMLButtonElement;
const pageInfoLi = document.getElementById("Number") as HTMLParagraphElement;
const nameSearchInput = document.getElementById("searchName") as HTMLInputElement;
const statusFilterSelect = document.getElementById("statusFilter") as HTMLSelectElement;
const btnRegresarFav = document.getElementById("btnRegresar") as HTMLButtonElement;

//Datos crudos
let currentRawCharactersData: Character[] = [];
let currentRawEpisodesData: Episode[] = [];

let globalModalInstance: HTMLDialogElement | null = null;

//Vista por defecto
let currentView = "characters";

//Variables de caracteres
let currentCharacterUrl = new ApiService().URLCharacters;
let charPrevPageUrl: string | null = null;
let charNextPageUrl: string | null = null;
let charTotalPages = 1;
let charCurrentPageNumber: number = 1;
let currentCharacterFilters: Filters = {
  name: "",
  status: "",
};

//Variables de episodios
let currentEpisodeUrl = new ApiService().URLEpisodes;
let episodePrevPageUrl: string | null = null;
let episodeNextPageUrl: string | null = null;
let episodeTotalPages = 1;
let episodeCurrentPageNumber: number | null = 1;
let currentEpisodeFilters: Filters = {
  name: "",
};

/**
 * @function renderContent Renderiza el contenido de personajes/caracteres/favoritos
 * 
 */
async function renderContent(resetPage = false) {

  mainContentContainer.innerHTML = `<p> Cargando ${currentView}...</p>`;

  let dataToRender: (Character | Episode)[] = [];
  let contentHtml = "";

  //Manejo de filtros en las diferentes vistas
  if (currentView === "characters") {
    statusFilterSelect.style.display = "inline-block";
    nameSearchInput.style.display = "inline-block"
  } else if (currentView === "episodes") {
    statusFilterSelect.style.display = "none";
    nameSearchInput.style.display = "inline-block";
  }
  if (
    currentView === "favoriteCharacters" ||
    currentView === "favoriteEpisodes"
  ) {
    statusFilterSelect.style.display = "none";
    nameSearchInput.style.display = "none";
    btnRegresarFav.style.display = "inline-block";
  } else {
    btnRegresarFav.style.display = "none";
  }

  //VIsta de personajes
  if (currentView === "characters") {
    let fetchUrl = currentCharacterUrl;
    if (resetPage) {
      const baseUrl = new URL(new ApiService().URLCharacters);
      for (const key in currentCharacterFilters) {
        if (currentCharacterFilters[key]) {
          baseUrl.searchParams.set(key,currentCharacterFilters[key]);
        }
      }
      fetchUrl = baseUrl.toString();
    }

    const { html,info,rawCharactersData } = await getCharactersHtml(
      fetchUrl,
      currentCharacterFilters
    );
    mainContentContainer.innerHTML = html;
    currentRawCharactersData = rawCharactersData;
    dataToRender = rawCharactersData;

    charPrevPageUrl = info.prev;
    charNextPageUrl = info.next;
    charTotalPages = info.pages;
    if (charPrevPageUrl === null) {
      charCurrentPageNumber = 1;
    } else if (charNextPageUrl === null) {
      charCurrentPageNumber = charTotalPages;
    } else {

      charCurrentPageNumber = getCharPageNumber(charPrevPageUrl) + 1;

    }
    if (charTotalPages === 0) charCurrentPageNumber = 0;
    else if (
      charTotalPages === 1 &&
      charPrevPageUrl === null &&
      charNextPageUrl === null
    )
      charCurrentPageNumber = 1;

    updatePaginationButtons(
      charPrevPageUrl,
      charNextPageUrl,
      charCurrentPageNumber,
      charTotalPages
    );

    //Vista de episodios
  } else if (currentView === "episodes") {
    let fetchUrl = currentEpisodeUrl;
    if (resetPage) {
      const baseUrl = new URL(new ApiService().URLEpisodes);
      for (const key in currentEpisodeFilters) {
        if (currentEpisodeFilters[key]) {
          baseUrl.searchParams.set(key,currentEpisodeFilters[key]);
        }
      }
      fetchUrl = baseUrl.toString();
    }

    const { html,info,rawEpisodesData } = await getEpisodesHtml(
      fetchUrl,
      currentEpisodeFilters
    );

    mainContentContainer.innerHTML = html;
    currentRawEpisodesData = rawEpisodesData;
    dataToRender = rawEpisodesData;

    episodePrevPageUrl = info.prev;
    episodeNextPageUrl = info.next;
    episodeTotalPages = info.pages;
    if (episodePrevPageUrl === null) {
      episodeCurrentPageNumber = 1;
    } else if (episodeNextPageUrl === null) {
      episodeCurrentPageNumber = episodeTotalPages;
    } else {
      episodeCurrentPageNumber = getEpisodePageNumber(episodePrevPageUrl) + 1;
    }
    if (episodeTotalPages === 0) episodeCurrentPageNumber = 0;
    else if (
      episodeTotalPages === 1 &&
      episodePrevPageUrl === null &&
      episodeNextPageUrl === null
    )
      episodeCurrentPageNumber = 1;

    updatePaginationButtons(
      episodePrevPageUrl,
      episodeNextPageUrl,
      episodeCurrentPageNumber,
      episodeTotalPages
    );

    //Vista de favoritos de personajes
  } else if (currentView === "favoriteCharacters") {
    const api = new ApiService();
    const favoriteCharacterIds = Array.from(favoriteCharacters);

    try {
      const fetchFavoritesCharacters = await api.getByIds(
        "character",
        favoriteCharacterIds
      );
      dataToRender = fetchFavoritesCharacters;
      contentHtml = dataToRender.map((char) => char.render()).join("");
      if (dataToRender.length === 0) {
        contentHtml = "<p>No tienes favoritos</p>";
      }
    } catch (error) {
      console.log("Error en obtener los favoritos");
    }

    //const favoriteData = currentRawCharactersData.filter((char) =>
    //favoriteCharacterIds.includes(char.id)
    //);
    //contentHtml = favoriteData.map((char) => char.render()).join("");
    mainContentContainer.innerHTML = contentHtml;
    //dataToRender = favoriteData;
    updatePaginationButtons(null,null,1,1);

    //Vista de favoritos de episodios
  } else if (currentView === "favoriteEpisodes") {
    const api = new ApiService();
    const favoriteEpisodesIds = Array.from(favoriteEpisodes);
    try {
      const fetchFavoritesEpisodes = await api.getByIds(
        "episode",
        favoriteEpisodesIds
      );
      dataToRender = fetchFavoritesEpisodes;
      contentHtml = dataToRender.map((ep) => ep.render()).join("");
      if (dataToRender.length === 0) {
        contentHtml = "<p>No tienes favoritos</p>";
      }
    } catch (error) {
      console.log("Error en obtener los favoritos");
    }
    //const favoriteData = currentRawEpisodesData.filter((ep) =>
    //  favoriteEpisodesIds.includes(ep.id)
    //);
    //contentHtml = favoriteData.map((ep) => ep.render()).join("");
    mainContentContainer.innerHTML = contentHtml;
    //dataToRender = favoriteData;
    updatePaginationButtons(null,null,1,1);
  }

  dataToRender.forEach((item) => {
    const type = item.episode ? "episode" : "character";
    const cardElement = mainContentContainer.querySelector(
      `[data-${type}-id="${item.id}"]`
    );
    if (cardElement) {
      const favoriteButton = cardElement.querySelector(".favorite");
      if (favoriteButton && isFavorite(item.id,type)) {
        favoriteButton.classList.add("active");
      }
    }
  });
}

/**
 *  Actualiza los botones de paginacion y da el numero total de paginas
 * @param {*} prevUrl Url previa
 * @param {*} nextUrl Url siguiente
 * @param {*} currentPage Pagina inicial
 * @param {*} totalPages Total de paginas
 */
function updatePaginationButtons(prevUrl: string | null,nextUrl: string | null,currentPage: number | null,totalPages: number) {
  if (prevUrl) {
    prevBtn.classList.remove("disabled");
    prevBtn.removeAttribute("tabindex");
  } else {
    prevBtn.classList.add("disabled");
    prevBtn.setAttribute("tabindex","-1");
  }

  pageInfoLi.textContent = `Página ${currentPage} de ${totalPages}`;

  if (nextUrl) {
    nextBtn.classList.remove("disabled");
    nextBtn.removeAttribute("tabindex");
  } else {
    nextBtn.classList.add("disabled");
    nextBtn.setAttribute("tabindex","-1");
  }
}

/**
 * Crea y muestra el modal
 * @param {string} title
 * @param {Promise<string>} contentPromise  promesa que resuelve con el HTML del contenido.
 */
async function createAndShowModal(title: string,contentPromise: Promise<string>) {
  if (!globalModalInstance) {
    globalModalInstance = document.createElement("dialog");
    globalModalInstance.id = "dynamicModal";
    globalModalInstance.classList.add("modal");
    document.body.appendChild(globalModalInstance);

    globalModalInstance.innerHTML = `
            <div class="modal-header">
                <h2 id="modalTitle"></h2>
                <button id="closeModalBtn" class="close-button">&times;</button>
            </div>
            <div class="modal-body" id="modalContent">
                <p>Cargando...</p>
            </div>
        `;

    const closeBtn = globalModalInstance.querySelector("#closeModalBtn")

    if (closeBtn instanceof HTMLButtonElement) {
      closeBtn.addEventListener("click",() => {
        globalModalInstance?.close();
      });
    }


    globalModalInstance.addEventListener("click",(e: MouseEvent) => {
      if (e.target === globalModalInstance) {
        globalModalInstance?.close();
      }
    });
  }

  if (!globalModalInstance) {
    console.error("El modal no pudo ser inicializado.");
    return; // Salir si el modal no se pudo crear
  }

  const modalTitleElement = globalModalInstance.querySelector("#modalTitle")
  if (modalTitleElement instanceof HTMLElement) {
    modalTitleElement.textContent = title
  }

  const modalContentDiv = globalModalInstance.querySelector("#modalContent") as HTMLDivElement;
  modalContentDiv.innerHTML = "<p>Cargando información detallada...</p>";

  globalModalInstance.showModal();

  try {
    const contentHtml = await contentPromise;
    modalContentDiv.innerHTML = contentHtml;
  } catch (error) {
    console.error("Error al cargar contenido del modal:",error);
    modalContentDiv.innerHTML = "<p>Error al cargar la información.</p>";
  }
}

//Carga el DOM
document.addEventListener("DOMContentLoaded",() => {
  currentView = "characters";
  loadFavorites();
  renderContent();
  const viewFavoritesBtn = document.getElementById("viewFavoritesBtn");
  if (viewFavoritesBtn) {
    viewFavoritesBtn.addEventListener("click",() => {
      if (
        currentView === "characters" ||
        currentView === "favoriteCharacters"
      ) {
        currentView = "favoriteCharacters";
      } else if (
        currentView === "episodes" ||
        currentView === "favoriteEpisodes"
      ) {
        currentView = "favoriteEpisodes";
      }
      renderContent();
    });
  }
});

//VIsta de episodios
episodesSelect.addEventListener("click",() => {
  if (currentView !== "episodes") {
    currentView = "episodes";
    currentEpisodeUrl = new ApiService().URLEpisodes;
    nameSearchInput.value = "";
    currentEpisodeFilters.name = "";
    renderContent(true);
  }
});

//Vista de personajes
charactersButton.addEventListener("click",() => {
  if (currentView !== "characters") {
    currentView = "characters";
    currentCharacterUrl = new ApiService().URLCharacters;
    nameSearchInput.value = "";
    currentCharacterFilters.name = "";
    renderContent(true);
  }
});
//Botones de prev y next
prevBtn.addEventListener("click",(e) => {
  e.preventDefault();
  if (currentView === "characters" && charPrevPageUrl) {
    currentCharacterUrl = charPrevPageUrl;
    renderContent();
  } else if (currentView === "episodes" && episodePrevPageUrl) {
    currentEpisodeUrl = episodePrevPageUrl;
    renderContent();
  }
});

nextBtn.addEventListener("click",(e) => {
  e.preventDefault();
  if (currentView === "characters" && charNextPageUrl) {
    currentCharacterUrl = charNextPageUrl;
    renderContent();
  } else if (currentView === "episodes" && episodeNextPageUrl) {
    currentEpisodeUrl = episodeNextPageUrl;
    renderContent();
  }
});

//Botones de filtro
statusFilterSelect.addEventListener("change",() => {
  if (currentView === "characters") {
    currentCharacterFilters.status = statusFilterSelect.value;
    currentCharacterFilters.name = nameSearchInput.value.trim();
    currentCharacterUrl = new ApiService().URLCharacters;
    renderContent(true);
  }
});

btnRegresarFav.addEventListener("click",() => {
  if (currentView === "favoriteCharacters") {
    currentView = "characters";
    renderContent(true);
  } else if (currentView === "favoriteEpisodes") {
    currentView = "episodes";
    renderContent(true);
  } else {
    console.log("Error");
  }
});

nameSearchInput.addEventListener("input",(e) => {
  if (currentView === "characters") {
    currentCharacterFilters.name = nameSearchInput.value.trim();
    currentCharacterUrl = new ApiService().URLCharacters;
    renderContent(true);
  } else if (currentView === "episodes") {
    currentEpisodeFilters.name = nameSearchInput.value.trim();
    currentEpisodeUrl = new ApiService().URLEpisodes;
    renderContent(true);
  }
});

nameSearchInput.addEventListener("keypress",(e) => {
  if (!(e.target instanceof HTMLElement)) {
    console.error("El target del evento no es un HTMLElement.");
    return;
  }
  if (e.key === "Enter") {
    e.target.blur();
  }
});

//Evento para mostrar el modal
mainContentContainer.addEventListener("click",async (e) => {
  if (!(e.target instanceof HTMLElement)) {
    console.error("El target del evento no es un HTMLElement.");
    return;
  }

  const favoriteButton = e.target.closest(".favorite");
  if (favoriteButton) {
    e.stopPropagation();

    const cardElement: DataCardElement | null =
      favoriteButton.closest(".img-container") ||
      favoriteButton.closest(".episode-card");
    if (cardElement) {
      const itemIdString = cardElement.dataset.characterId || cardElement.dataset.episodeId;

      if (itemIdString === undefined) {
        console.error("No se encontró characterId ni episodeId en el dataset de la tarjeta de favoritos.");
        return;
      }

      const itemId: number = parseInt(itemIdString);
      if (isNaN(itemId)) {
        console.error(`El ID '${itemIdString}' no es un número válido para el favorito.`);
        return;
      }


      const itemType: "character" | "episode" = cardElement.classList.contains("img-container")
        ? "character"
        : "episode";

      itemFavorites(itemId,itemType);


      favoriteButton.classList.toggle("active");
    }
    return;
  }




  const characterCard = e.target.closest(".img-container");
  const episodeCard = e.target.closest(".episode-card");



  if (characterCard instanceof HTMLElement) {
    console.log("Se hizo clic dentro de un contenedor  de personaje.");

  }
  if (episodeCard instanceof HTMLElement) {

    console.log("Se hizo clic dentro de una tarjeta de episodio.");

  }


  if (
    (characterCard instanceof HTMLElement && characterCard.dataset.characterId !== undefined) &&
    (currentView === "characters" || currentView === "favoriteCharacters")
  ) {
    const characterIdString = characterCard.dataset.characterId;
    const characterId: number = parseInt(characterIdString);

    if (isNaN(characterId)) {
      console.error(`ID de personaje inválido: '${characterIdString}'.`);
      return;
    }


    const character = currentRawCharactersData.find(
      (char) => char.id === characterId
    );

    if (character) {
      await createAndShowModal(
        `${character.name}`,
        character.getModalContent()
      );
    }
  }

  else if (
    (episodeCard instanceof HTMLElement && episodeCard.dataset.episodeId !== undefined) &&
    (currentView === "episodes" || currentView === "favoriteEpisodes")
  ) {
    const episodeIdString = episodeCard.dataset.episodeId;
    const episodeId: number = parseInt(episodeIdString);

    if (isNaN(episodeId)) {
      console.error(`ID de episodio inválido: '${episodeIdString}'.`);
      return;
    }


    const episode = currentRawEpisodesData.find((ep) => ep.id === episodeId);

    if (episode) {
      await createAndShowModal(
        `${episode.id}: ${episode.name}`,
        episode.getModalContent()
      );
    }
  }
});

//Overlay
const navBar = document.querySelector("nav") as HTMLElement,
  menuBtns = document.querySelectorAll(".menu-icon"),
  overlay = document.querySelector(".overlay") as HTMLElement;

menuBtns.forEach((menuBtn) => {
  menuBtn.addEventListener("click",() => {
    navBar.classList.toggle("open");
  });
});

overlay.addEventListener("click",() => {
  navBar.classList.remove("open");
});
