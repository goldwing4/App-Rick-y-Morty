let currentPageUrl = "https://rickandmortyapi.com/api/character";
let nextPageUrl = null;
let prevPageUrl = null;

function getCharacters(url, done) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      nextPageUrl = data.info.next;
      prevPageUrl = data.info.prev;
      done(data);
      // elementos
      let prevBtn = document.getElementById("PrevBtn");
      let nextBtn = document.getElementById("NextBtn");
      setupPagination(prevBtn, nextBtn);
      // ejemplo de volver a renderizar un elemento dinamico
      const pagination = document.querySelector("ul.pagination");
      const cloneNode = pagination.cloneNode(true);
      pagination.replaceWith(cloneNode);
    })
    .catch((error) => {
      console.error("Error al obtener personajes:", error);
    });
}

function displayCharacters(data) {
  const article = document.querySelector("article");
  article.innerHTML = "";

  data.results.forEach((personaje) => {
    const sectionCharacter = document.createRange().createContextualFragment(`
            <div class="img-container">
             <img
               src="${personaje.image}"
               alt="${personaje.name}"
             />
             <h2>${personaje.name}</h2>
           <span>${personaje.status} - ${personaje.species}</span>
           <div>
             <span>${personaje.gender}</span>
             <span class="fa-solid fa-house" style="justify-self"></span>
             <span> ${personaje.origin.name}</span>
             <span class="fa-solid fa-location-dot" style="justify-self"></span>
             <span>${personaje.location.name}</span>
           </div>
           </div>
         `);
    article.append(sectionCharacter);
  });
}

function setupPagination(prevBtn, nextBtn) {
  // elementos dinamicos
  console.log(prevBtn, nextBtn);
  if (prevPageUrl) {
    prevBtn.classList.remove("disabled");
    prevBtn.onclick = (e) => {
      e.preventDefault();
      currentPageUrl = prevPageUrl;
      getCharacters(currentPageUrl, displayCharacters);
    };
  } else {
    prevBtn.classList.add("disabled");
    prevBtn.onclick = null;
  }

  if (nextPageUrl) {
    nextBtn.classList.remove("disabled");
    nextBtn.onclick = (e) => {
      e.preventDefault();
      currentPageUrl = nextPageUrl;
      getCharacters(currentPageUrl, displayCharacters);
    };
  } else {
    nextBtn.classList.add("disabled");
    nextBtn.onclick = null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  getCharacters(currentPageUrl, displayCharacters);
});
