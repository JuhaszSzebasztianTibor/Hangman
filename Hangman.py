
from flask import Flask, jsonify, request, render_template
import requests
import random

app = Flask(__name__)

# Function for fetching a random word from an API
def fetch_word():
    url = "https://www.mit.edu/~ecprice/wordlist.10000"
    response = requests.get(url)
    if response.status_code == 200: #HTTP 200 OK successful response status code indicates that a request has succeeded.
            words = [
                word for word in response.text.splitlines() 
                if 3 <= len(word) <= 8 and 
                word[-1] != "s"  and   #alternative solution' not word.endswith("s") '
                word[-2:] != "ed" and
                word[-3:] != "ing" # excluding words that end with the specified suffixes(ed,s,ing)
                ] #choosing words that are min 3 char and max 8 char 
            return random.choice(words)
    else:
        return "python"  # Fallback word

# Endpoint to start a new game
@app.route("/start_game", methods=["GET"])
def start_game():
    word = fetch_word()
    hidden_word = "_ " * len(word)
    return jsonify({"word": word, "hidden_word": hidden_word, "attempts_left": 6})

# Endpoint to process a guess
@app.route("/guess", methods=["POST"])
def guess():
    data = request.json
    word = data.get("word")
    guessed_letters = set(data.get("guessed_letters", []))
    guess = data.get("guess", "").lower()

    if not guess.isalpha() or len(guess) != 1:
        return jsonify({"error": "Only letter is allowed"}), 400  # Return error for invalid input

    if guess in word:
        guessed_letters.add(guess)

    hidden_word = " ".join([letter if letter in guessed_letters else "_" for letter in word])
    attempts_left = data.get("attempts_left", 6)
    
    if guess not in word:
        attempts_left -= 1

    game_over = attempts_left <= 0 or "_" not in hidden_word

    return jsonify({
        "hidden_word": hidden_word,
        "guessed_letters": list(guessed_letters),
        "attempts_left": attempts_left,
        "game_over": game_over,
        "word": word if game_over else None
    })

# Serve the frontend
@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)