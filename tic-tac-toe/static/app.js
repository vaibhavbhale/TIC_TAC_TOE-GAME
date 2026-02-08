const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const resetBtn = document.getElementById("reset");

const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDEl = document.getElementById("scoreD");

let lastPlayedIndex = null;

function popStatus() {
  statusEl.classList.remove("pop");
  void statusEl.offsetWidth; // restart animation
  statusEl.classList.add("pop");
}

function setStatusFromState(s) {
  if (s.gameOver) {
    statusEl.textContent = s.winner ? `${s.winner} wins!` : `It’s a draw.`;
  } else {
    statusEl.textContent = `${s.turn}’s turn`;
  }
  popStatus();
}

function render(s) {
  scoreXEl.textContent = s.score.X;
  scoreOEl.textContent = s.score.O;
  scoreDEl.textContent = s.score.D;

  setStatusFromState(s);

  boardEl.classList.remove("draw");
  if (s.gameOver && !s.winner) {
    void boardEl.offsetWidth;
    boardEl.classList.add("draw");
    setTimeout(() => boardEl.classList.remove("draw"), 450);
  }

  boardEl.innerHTML = "";

  s.board.forEach((val, i) => {
    const btn = document.createElement("button");
    btn.className = "cell";
    btn.type = "button";

    btn.dataset.val = val; // "" | "X" | "O"
    btn.textContent = "";  // mark drawn via CSS ::before

    btn.disabled = s.gameOver || val !== "";

    if (i === lastPlayedIndex && val !== "") {
      btn.classList.add("just-played");
    }

    btn.addEventListener("click", () => makeMove(i));
    boardEl.appendChild(btn);
  });

  if (s.winLine && s.winLine.length === 3) {
    const btns = [...boardEl.querySelectorAll(".cell")];
    s.winLine.forEach(idx => btns[idx]?.classList.add("win"));
  }
}

async function loadState() {
  const res = await fetch("/api/state");
  const data = await res.json();
  lastPlayedIndex = null;
  render(data);
}

async function makeMove(index) {
  const res = await fetch("/api/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ index })
  });

  const data = await res.json();
  if (!res.ok) {
    console.error(data.error || "Move failed");
    return;
  }

  lastPlayedIndex = index;
  render(data);
  setTimeout(() => { lastPlayedIndex = null; }, 260);
}

restartBtn.addEventListener("click", async () => {
  const res = await fetch("/api/restart", { method: "POST" });
  const data = await res.json();
  lastPlayedIndex = null;
  render(data);
});

resetBtn.addEventListener("click", async () => {
  const res = await fetch("/api/reset", { method: "POST" });
  const data = await res.json();
  lastPlayedIndex = null;
  render(data);
});

loadState();
