const body = document.body;

// Scroll-to-top button
const toTop = document.getElementById("toTop");
function updateToTop() {
  if (!toTop) return;
  toTop.classList.toggle("show", window.scrollY > 240);
}
window.addEventListener("scroll", updateToTop, { passive: true });
updateToTop();

toTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Nav active state + show/hide About section
const navHome = document.getElementById("navHome");
const navAbout = document.getElementById("navAbout");

let miniTimer = null;

function setActiveNav(isAbout) {
  navHome?.classList.toggle("active", !isAbout);
  navAbout?.classList.toggle("active", isAbout);
}

function stopMiniDemo(clear = true) {
  if (miniTimer) {
    clearInterval(miniTimer);
    miniTimer = null;
  }
  if (clear) clearMini();
}

function applyViewFromHash() {
  const hash = (location.hash || "#home").toLowerCase();
  const isAbout = hash === "#about";

  body.classList.toggle("show-about", isAbout);
  setActiveNav(isAbout);

  // Mini preview only in Home view
  if (isAbout) stopMiniDemo(true);
  else startMiniDemo();
}

window.addEventListener("hashchange", applyViewFromHash);

// Mini-board autoplay demo (Home view only)
const miniBoard = document.getElementById("miniBoard");
const miniCells = miniBoard ? [...miniBoard.querySelectorAll(".miniCell")] : [];

const seq = [0, 4, 1, 3, 2]; // X wins top row
let step = 0;
let phase = "play";

function clearMini() {
  miniCells.forEach(c => {
    c.dataset.val = "";
    c.classList.remove("miniWin");
  });
}

function tickMini() {
  if (!miniCells.length) return;

  if (phase === "play") {
    if (step === 0) clearMini();

    if (step < seq.length) {
      const idx = seq[step];
      const mark = step % 2 === 0 ? "X" : "O";
      miniCells[idx].dataset.val = mark;
      miniCells[idx].classList.add("miniPop");
      setTimeout(() => miniCells[idx].classList.remove("miniPop"), 220);
      step++;
      return;
    }
    [0, 1, 2].forEach(i => miniCells[i].classList.add("miniWin"));
    phase = "showWin";
    return;
  }

  if (phase === "showWin") {
    phase = "clear";
    return;
  }

  clearMini();
  step = 0;
  phase = "play";
}

function startMiniDemo() {
  if (!miniCells.length) return;
  if (miniTimer) return; // already running
  miniTimer = setInterval(tickMini, 520);
  tickMini();
}

// init
applyViewFromHash();