from flask import Flask, jsonify, render_template, request, session, redirect, url_for

app = Flask(__name__)
app.secret_key = "change-me-to-a-random-secret"  # needed for sessions

WIN_LINES = [
    (0, 1, 2), (3, 4, 5), (6, 7, 8),
    (0, 3, 6), (1, 4, 7), (2, 5, 8),
    (0, 4, 8), (2, 4, 6),
]


def fresh_state(keep_score=False):
    score = session.get("score", {"X": 0, "O": 0, "D": 0}) if keep_score else {"X": 0, "O": 0, "D": 0}
    session["board"] = [""] * 9
    session["turn"] = "X"
    session["gameOver"] = False
    session["winner"] = ""
    session["winLine"] = []
    session["score"] = score

def ensure_state():
    if "board" not in session:
        fresh_state(keep_score=False)


def check_winner(board):
    for a, b, c in WIN_LINES:
        if board[a] and board[a] == board[b] == board[c]:
            return board[a], [a, b, c]
    return "", []


def state_payload():
    return {
        "board": session["board"],
        "turn": session["turn"],
        "gameOver": session["gameOver"],
        "winner": session["winner"],
        "winLine": session["winLine"],
        "score": session["score"],
    }


@app.get("/")
def home():
    return render_template("home.html")


@app.get("/game")
def game():
    return render_template("index.html")


@app.get("/start")
def start():
    # Fresh start: reset board + reset score
    fresh_state(keep_score=False)
    return redirect(url_for("game"))


@app.get("/api/state")
def api_state():
    ensure_state()
    return jsonify(state_payload())


@app.post("/api/restart")
def api_restart():
    ensure_state()
    fresh_state(keep_score=True)
    return jsonify(state_payload())


@app.post("/api/reset")
def api_reset():
    fresh_state(keep_score=False)
    return jsonify(state_payload())


@app.post("/api/move")
def api_move():
    ensure_state()

    if session["gameOver"]:
        return jsonify({"error": "Game is over. Restart the round."}), 400

    data = request.get_json(silent=True) or {}
    idx = data.get("index")

    if not isinstance(idx, int) or idx < 0 or idx > 8:
        return jsonify({"error": "Invalid cell index."}), 400

    board = session["board"]
    if board[idx]:
        return jsonify({"error": "Cell already taken."}), 400

    turn = session["turn"]
    board[idx] = turn

    winner, line = check_winner(board)
    if winner:
        session["gameOver"] = True
        session["winner"] = winner
        session["winLine"] = line
        session["score"][winner] += 1
        return jsonify(state_payload())

    if all(board):
        session["gameOver"] = True
        session["winner"] = ""
        session["winLine"] = []
        session["score"]["D"] += 1
        return jsonify(state_payload())

    session["turn"] = "O" if turn == "X" else "X"
    return jsonify(state_payload())


if __name__ == "__main__":
    app.run(debug=True)
