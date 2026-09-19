(function () {
  "use strict";

  const app = document.getElementById("app");
  const status = document.getElementById("status");
  const pageTitle = document.getElementById("page-title");
  const pageSubtitle = document.getElementById("page-subtitle");

  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbCaption = document.getElementById("lb-caption");
  const lbClose = document.getElementById("lb-close");
  const lbPrev = document.getElementById("lb-prev");
  const lbNext = document.getElementById("lb-next");

  let currentImages = [];
  let currentIndex = 0;

  function fmtCount(n) {
    return n + (n === 1 ? " print" : " prints");
  }

  function openLightbox(images, index) {
    currentImages = images;
    currentIndex = index;
    showCurrent();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  function showCurrent() {
    const img = currentImages[currentIndex];
    lbImg.src = img.file;
    lbImg.alt = "";
    lbCaption.textContent = `${currentIndex + 1} / ${currentImages.length}`;
  }

  function step(delta) {
    currentIndex = (currentIndex + delta + currentImages.length) % currentImages.length;
    showCurrent();
  }

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", () => step(-1));
  lbNext.addEventListener("click", () => step(1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  function renderPhotoGrid(album) {
    pageTitle.textContent = album.title;
    const bits = [fmtCount(album.images.length)];
    if (album.date) bits.push(album.date);
    pageSubtitle.textContent = bits.join(" · ");

    app.innerHTML = "";

    const back = document.createElement("a");
    back.href = "#";
    back.className = "back-link";
    back.textContent = "← todos os jogos";
    app.appendChild(back);

    if (album.description) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = album.description;
      app.appendChild(p);
    }

    const grid = document.createElement("div");
    grid.className = "photo-grid";

    album.images.forEach((img, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", `Abrir imagem ${i + 1}`);
      const im = document.createElement("img");
      im.src = img.thumb;
      im.loading = "lazy";
      im.decoding = "async";
      im.alt = "";
      im.addEventListener("load", () => im.classList.add("loaded"));
      btn.appendChild(im);
      btn.addEventListener("click", () => openLightbox(album.images, i));
      grid.appendChild(btn);
    });

    app.appendChild(grid);
  }

  function fmtGames(n) {
    return n + (n === 1 ? " jogo" : " jogos");
  }

  function renderAlbumPicker(albums) {
    pageTitle.textContent = "Prints";
    const total = albums.reduce((n, a) => n + a.images.length, 0);
    pageSubtitle.textContent = fmtCount(total) + " · " + fmtGames(albums.length);

    app.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "albums-grid";

    albums.forEach((album) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "album-card";
      const cover = album.images[0];
      card.innerHTML = `
        <img src="${cover.thumb}" loading="lazy" alt="" />
        <div class="album-meta">
          <h2>${album.title}</h2>
          <div class="muted">${fmtCount(album.images.length)}${album.date ? " · " + album.date : ""}</div>
        </div>
      `;
      card.addEventListener("click", () => {
        location.hash = "#" + encodeURIComponent(album.slug);
      });
      grid.appendChild(card);
    });

    app.appendChild(grid);
  }

  function route() {
    const albums = window.__ALBUMS__;
    const slug = decodeURIComponent(location.hash.replace(/^#/, ""));
    const album = albums.find((a) => a.slug === slug);

    if (album) {
      renderPhotoGrid(album);
    } else {
      renderAlbumPicker(albums);
    }
  }

  window.addEventListener("hashchange", route);

  fetch("data/albums.json")
    .then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then((data) => {
      const albums = data.albums || [];
      if (albums.length === 0) {
        status.textContent = "Nenhum album encontrado ainda.";
        return;
      }
      window.__ALBUMS__ = albums;
      status.remove();
      route();
    })
    .catch((err) => {
      status.textContent = "Erro ao carregar a galeria: " + err.message;
    });
})();
