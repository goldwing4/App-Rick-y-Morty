import {
  getCharactersHtml,
  getPageNumberFromUrl as getCharPageNumber,
} from "./Character.js";
import {
  getEpisodesHtml,
  getPageNumberFromUrlEpisodes as getEpisodePageNumber,
} from "./Episode.js";
import { ApiService } from "./Classes.js";

const episodesSelect = document.getElementById("episodes");
const charactersButton = document.getElementById("character");
const mainContentContainer = document.querySelector("article");
const prevBtn = document.getElementById("PrevBtn");
const nextBtn = document.getElementById("NextBtn");
const pageInfoLi = document.getElementById("Number");
const nameSearchInput = document.getElementById("searchName");
const statusFilterSelect = document.getElementById("statusFilter");

let currentView = "characters";
//Variables de caracteres
let currentCharacterUrl = new ApiService().URLCharacters;
let charPrevPageUrl = null;
let charNextPageUrl = null;
let charTotalPages = 1;
let charCurrentPageNumber = 1;
let currentCharacterFilters = {
  status: "",
  name: "",
};
//Variables de episodios
let currentEpisodeUrl = new ApiService().URLEpisodes;
let episodePrevPageUrl = null;
let episodeNextPageUrl = null;
let episodeTotalPages = 1;
let episodeCurrentPageNumber = 1;
let currentEpisodeFilters = {
  name: "",
};
/**
 *
 * @param {*} resetPage
 */
async function renderContent(resetPage = false) {
  mainContentContainer.innerHTML = "";

  if (currentView === "characters") {
    statusFilterSelect.style.display = "inline-block";
  } else if (currentView === "episodes") {
    statusFilterSelect.style.display = "none";
  }

  if (currentView === "characters") {
    let fetchUrl = currentCharacterUrl;
    if (resetPage) {
      const baseUrl = new URL(new ApiService().URLCharacters);
      for (const key in currentCharacterFilters) {
        if (currentCharacterFilters[key]) {
          baseUrl.searchParams.set(key, currentCharacterFilters[key]);
        }
      }
      fetchUrl = baseUrl.toString();
    }

    const { html, info } = await getCharactersHtml(
      fetchUrl,
      currentCharacterFilters
    );
    if (info && info.count === 0) {
      console.log("No se encontraron personajes con ese nombre.");
    }
    mainContentContainer.innerHTML = html;

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
  } else if (currentView === "episodes") {
    let fetchUrl = currentEpisodeUrl;
    if (resetPage) {
      const baseUrl = new URL(new ApiService().URLEpisodes);
      for (const key in currentEpisodeFilters) {
        if (currentEpisodeFilters[key]) {
          baseUrl.searchParams.set(key, currentEpisodeFilters[key]);
        }
      }
      fetchUrl = baseUrl.toString();
    }

    const { html, info } = await getEpisodesHtml(
      fetchUrl,
      currentEpisodeFilters
    );

    mainContentContainer.innerHTML = html;

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
  }
}

function updatePaginationButtons(prevUrl, nextUrl, currentPage, totalPages) {
  if (prevUrl) {
    prevBtn.classList.remove("disabled");
    prevBtn.removeAttribute("tabindex");
  } else {
    prevBtn.classList.add("disabled");
    prevBtn.setAttribute("tabindex", "-1");
  }

  pageInfoLi.textContent = `Página ${currentPage} de ${totalPages}`;

  if (nextUrl) {
    nextBtn.classList.remove("disabled");
    nextBtn.removeAttribute("tabindex");
  } else {
    nextBtn.classList.add("disabled");
    nextBtn.setAttribute("tabindex", "-1");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  currentView = "characters";
  renderContent();
});

episodesSelect.addEventListener("click", () => {
  if (currentView !== "episodes") {
    currentView = "episodes";
    currentEpisodeUrl = new ApiService().URLEpisodes;
    nameSearchInput.value = "";
    currentEpisodeFilters.name = "";
    renderContent(true);
  }
});

charactersButton.addEventListener("click", () => {
  if (currentView !== "characters") {
    currentView = "characters";
    currentCharacterUrl = new ApiService().URLCharacters;
    nameSearchInput.value = "";
    currentCharacterFilters.name = "";
    renderContent(true);
  }
});

prevBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (currentView === "characters" && charPrevPageUrl) {
    currentCharacterUrl = charPrevPageUrl;
    renderContent();
  } else if (currentView === "episodes" && episodePrevPageUrl) {
    currentEpisodeUrl = episodePrevPageUrl;
    renderContent();
  }
});

nextBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (currentView === "characters" && charNextPageUrl) {
    currentCharacterUrl = charNextPageUrl;
    renderContent();
  } else if (currentView === "episodes" && episodeNextPageUrl) {
    currentEpisodeUrl = episodeNextPageUrl;
    renderContent();
  }
});

statusFilterSelect.addEventListener("change", () => {
  if (currentView === "characters") {
    currentCharacterFilters.status = statusFilterSelect.value;
    currentCharacterFilters.name = nameSearchInput.value.trim();
    currentCharacterUrl = new ApiService().URLCharacters;
    renderContent(true);
  }
});

nameSearchInput.addEventListener("input", (e) => {
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

nameSearchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.target.blur();
  }
});

//Overlay
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
