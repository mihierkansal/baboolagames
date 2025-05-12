import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Index,
  Match,
  onCleanup,
  onMount,
  Show,
  Signal,
  Switch,
} from "solid-js";
import {
  DragDropProvider,
  DragDropSensors,
  DragEvent,
  SortableProvider,
  closestCenter,
  createSortable,
} from "@thisbeyond/solid-dnd";

import "baboolastyles/public/plastic.css";

type dievalue = 1 | 2 | 3 | 4 | 5 | 6;

enum GameType {
  Digital,
  Board,
}

enum Game {
  MemoryMatcher,
  SnakesAndLadders,
  SpinnerWheel,
  TicTacToe,
  HangMan,
  WordScramble,

  FlappyBird,
  Snake,
}

interface GameTab {
  text: string;
  value: Game;
  type: GameType;
}

function App() {
  const boardGames: GameTab[] = [
    { text: "Memory Matcher", value: Game.MemoryMatcher, type: GameType.Board },
    {
      text: "Snakes and Ladders",
      value: Game.SnakesAndLadders,
      type: GameType.Board,
    },
    { text: "Spinner Wheel", value: Game.SpinnerWheel, type: GameType.Board },
    { text: "Tic Tac Toe", value: Game.TicTacToe, type: GameType.Board },
    { text: "Hangman", value: Game.HangMan, type: GameType.Board },
    { text: "Word Scramble", value: Game.WordScramble, type: GameType.Board },
  ];
  const digitalGames: GameTab[] = [
    {
      text: "Ball Jump",
      value: Game.FlappyBird,
      type: GameType.Board,
    },
    { text: "Snake", value: Game.Snake, type: GameType.Digital },
  ];

  const selectedGame = createSignal<Game | undefined>(Game.TicTacToe);

  const windowWidth = createSignal(window.innerWidth);
  window.addEventListener("resize", () => {
    windowWidth[1](window.innerWidth);
  });

  return (
    <>
      <Show
        fallback={
          <>
            <div class="screentoosmall">
              This window is too small. If you're on a computer, please resize
              the window to make it bigger.
            </div>
          </>
        }
        when={windowWidth[0]() >= 850}
      >
        <div class="menu">
          <h4>Board/Table Games</h4>
          <GameSelector games={boardGames} />
          <hr /> <h4>Digital Games</h4>
          <GameSelector games={digitalGames} />
        </div>
        <div class="game-container">
          <Switch>
            <Match when={selectedGame[0]() === Game.MemoryMatcher}>
              <MemoryMatcher />
            </Match>
            <Match when={selectedGame[0]() === Game.SnakesAndLadders}>
              <SnakesAndLadders />
            </Match>
            <Match when={selectedGame[0]() === Game.SpinnerWheel}>
              <SpinnerWheel />
            </Match>
            <Match when={selectedGame[0]() === Game.TicTacToe}>
              <TicTacToe />
            </Match>
            <Match when={selectedGame[0]() === Game.Snake}>
              <Snake />
            </Match>
            <Match when={selectedGame[0]() === Game.FlappyBird}>
              <BallJump />
            </Match>
            <Match when={selectedGame[0]() === Game.HangMan}>
              <Hangman />
            </Match>
            <Match when={selectedGame[0]() === Game.WordScramble}>
              <WordScramble />
            </Match>
          </Switch>
        </div>
      </Show>
    </>
  );

  function GameSelector({ games }: { games: GameTab[] }) {
    return (
      <>
        <For each={games}>
          {(game) => {
            return (
              <div
                class={selectedGame[0]() === game.value ? "selected" : ""}
                onClick={() => {
                  selectedGame[1](undefined);
                  selectedGame[1](game.value);
                }}
              >
                {game.text}
              </div>
            );
          }}
        </For>
      </>
    );
  }
}

function WordScramble() {
  const STARTING_SECONDS = 30;

  const words = [
    {
      word: "addition",
      hint: "The process of adding numbers",
    },
    {
      word: "meeting",
      hint: "Event in which people come together",
    },
    {
      word: "number",
      hint: "Math symbol used for counting",
    },
    {
      word: "exchange",
      hint: "The act of trading",
    },
    {
      word: "canvas",
      hint: "Piece of fabric for oil painting",
    },
    {
      word: "garden",
      hint: "Space for planting flower and plant",
    },
    {
      word: "position",
      hint: "Location of someone or something",
    },
    {
      word: "feather",
      hint: "Hair like outer covering of bird",
    },
    {
      word: "comfort",
      hint: "A pleasant feeling of relaxation",
    },
    {
      word: "tongue",
      hint: "The muscular organ of mouth",
    },
    {
      word: "expansion",
      hint: "The process of increase or grow",
    },
    {
      word: "country",
      hint: "A politically identified region",
    },
    {
      word: "group",
      hint: "A number of objects or persons",
    },
    {
      word: "taste",
      hint: "Ability of tongue to detect flavour",
    },
    {
      word: "store",
      hint: "Large shop where goods are traded",
    },
    {
      word: "field",
      hint: "Area of land for farming activities",
    },
    {
      word: "friend",
      hint: "Person other than a family member",
    },
    {
      word: "pocket",
      hint: "A bag for carrying small items",
    },
    {
      word: "needle",
      hint: "A thin and sharp metal pin",
    },
    {
      word: "expert",
      hint: "Person with extensive knowledge",
    },
    {
      word: "statement",
      hint: "A declaration of something",
    },
    {
      word: "second",
      hint: "One-sixtieth of a minute",
    },
    {
      word: "library",
      hint: "Place containing collection of books",
    },
  ];

  const word = words[Math.floor(Math.random() * words.length)];

  const won = createSignal(false);
  const lost = createSignal(false);
  let timer!: ReturnType<typeof setTimeout>;

  const timeSecRemaining = createSignal<number | undefined>(undefined);

  const items = createSignal(
    scrambleArray(
      word.word.split("").map((letter) => {
        return {
          text: letter,
          id: generateRandomString(9),
        };
      })
    )
  );

  createEffect(() => {
    if (
      items[0]()
        .map((item) => item.text)
        .join("") === word.word
    ) {
      won[1](true);
      clearInterval(timer);
    }

    if (timeSecRemaining[0]() === 0 && !won[0]()) {
      lost[1](true);
      clearInterval(timer);
    }
  });

  return (
    <>
      <h3>Word Scramble</h3>
      <p>
        Rearrange the tiles to unscramble the word. You will have 30 seconds,
        starting when you start to drag the tiles.
      </p>
      <p
        style={{
          "margin-top": "0.5rem",
        }}
      >
        Hint: {word.hint}
      </p>
      <div
        class="word-scramble-container"
        onMouseDown={() => {
          if (!won[0]() && !lost[0]() && !timer) {
            timer = setInterval(() => {
              timeSecRemaining[1]((v) => (v || STARTING_SECONDS) - 1);
            }, 1000);
          }
        }}
      >
        <Show when={won[0]()}>
          <div class="modal">
            That's correct! Word: {word.word.toUpperCase()}
          </div>
        </Show>
        <Show when={lost[0]()}>
          <div class="modal">Time's up. Word: {word.word.toUpperCase()} </div>
        </Show>
        <SortableList
          onReorder={(newOrder) => {
            console.log(newOrder);
            items[1](newOrder);
          }}
          items={items[0]()}
        />
      </div>
      <p
        style={{
          "margin-top": "1rem",
        }}
      >
        Seconds left: {timeSecRemaining[0]() || "--"}
      </p>
    </>
  );
}

function Hangman() {
  const wordList = [
    {
      word: "guitar",
      hint: "A musical instrument with strings.",
    },
    {
      word: "oxygen",
      hint: "A colorless, odorless gas essential for life.",
    },
    {
      word: "mountain",
      hint: "A large natural elevation of the Earth's surface.",
    },
    {
      word: "painting",
      hint: "An art form using colors on a surface to create images or expression.",
    },
    {
      word: "astronomy",
      hint: "The scientific study of celestial objects and phenomena.",
    },
    {
      word: "football",
      hint: "A popular sport played with a spherical ball.",
    },
    {
      word: "chocolate",
      hint: "A sweet treat made from cocoa beans.",
    },
    {
      word: "butterfly",
      hint: "An insect with colorful wings and a slender body.",
    },
    {
      word: "history",
      hint: "The study of past events and human civilization.",
    },
    {
      word: "pizza",
      hint: "A savory dish consisting of a round, flattened base with toppings.",
    },
    {
      word: "jazz",
      hint: "A genre of music characterized by improvisation and syncopation.",
    },
    {
      word: "camera",
      hint: "A device used to capture and record images or videos.",
    },
    {
      word: "diamond",
      hint: "A precious gemstone known for its brilliance and hardness.",
    },
    {
      word: "adventure",
      hint: "An exciting or daring experience.",
    },
    {
      word: "science",
      hint: "The systematic study of the structure and behavior of the physical and natural world.",
    },
    {
      word: "bicycle",
      hint: "A human-powered vehicle with two wheels.",
    },
    {
      word: "sunset",
      hint: "The daily disappearance of the sun below the horizon.",
    },
    {
      word: "coffee",
      hint: "A popular caffeinated beverage made from roasted coffee beans.",
    },
    {
      word: "dance",
      hint: "A rhythmic movement of the body often performed to music.",
    },
    {
      word: "galaxy",
      hint: "A vast system of stars, gas, and dust held together by gravity.",
    },
    {
      word: "orchestra",
      hint: "A large ensemble of musicians playing various instruments.",
    },
    {
      word: "volcano",
      hint: "A mountain or hill with a vent through which lava, rock fragments, hot vapor, and gas are ejected.",
    },
    {
      word: "novel",
      hint: "A long work of fiction, typically with a complex plot and characters.",
    },
    {
      word: "sculpture",
      hint: "A three-dimensional art form created by shaping or combining materials.",
    },
    {
      word: "symphony",
      hint: "A long musical composition for a full orchestra, typically in multiple movements.",
    },
    {
      word: "architecture",
      hint: "The art and science of designing and constructing buildings.",
    },
    {
      word: "ballet",
      hint: "A classical dance form characterized by precise and graceful movements.",
    },
    {
      word: "astronaut",
      hint: "A person trained to travel and work in space.",
    },
    {
      word: "waterfall",
      hint: "A cascade of water falling from a height.",
    },
    {
      word: "technology",
      hint: "The application of scientific knowledge for practical purposes.",
    },
    {
      word: "rainbow",
      hint: "A meteorological phenomenon that is caused by reflection, refraction, and dispersion of light.",
    },
    {
      word: "universe",
      hint: "All existing matter, space, and time as a whole.",
    },
    {
      word: "piano",
      hint: "A musical instrument played by pressing keys that cause hammers to strike strings.",
    },
    {
      word: "vacation",
      hint: "A period of time devoted to pleasure, rest, or relaxation.",
    },
    {
      word: "rainforest",
      hint: "A dense forest characterized by high rainfall and biodiversity.",
    },
    {
      word: "theater",
      hint: "A building or outdoor area in which plays, movies, or other performances are staged.",
    },
    {
      word: "telephone",
      hint: "A device used to transmit sound over long distances.",
    },
    {
      word: "language",
      hint: "A system of communication consisting of words, gestures, and syntax.",
    },
    {
      word: "desert",
      hint: "A barren or arid land with little or no precipitation.",
    },
    {
      word: "sunflower",
      hint: "A tall plant with a large yellow flower head.",
    },
    {
      word: "fantasy",
      hint: "A genre of imaginative fiction involving magic and supernatural elements.",
    },
    {
      word: "telescope",
      hint: "An optical instrument used to view distant objects in space.",
    },
    {
      word: "breeze",
      hint: "A gentle wind.",
    },
    {
      word: "oasis",
      hint: "A fertile spot in a desert where water is found.",
    },
    {
      word: "photography",
      hint: "The art, process, or practice of creating images by recording light or other electromagnetic radiation.",
    },
    {
      word: "safari",
      hint: "An expedition or journey, typically to observe wildlife in their natural habitat.",
    },
    {
      word: "planet",
      hint: "A celestial body that orbits a star and does not produce light of its own.",
    },
    {
      word: "river",
      hint: "A large natural stream of water flowing in a channel to the sea, a lake, or another such stream.",
    },
    {
      word: "tropical",
      hint: "Relating to or situated in the region between the Tropic of Cancer and the Tropic of Capricorn.",
    },
    {
      word: "mysterious",
      hint: "Difficult or impossible to understand, explain, or identify.",
    },
    {
      word: "enigma",
      hint: "Something that is mysterious, puzzling, or difficult to understand.",
    },
    {
      word: "paradox",
      hint: "A statement or situation that contradicts itself or defies intuition.",
    },
    {
      word: "puzzle",
      hint: "A game, toy, or problem designed to test ingenuity or knowledge.",
    },
    {
      word: "whisper",
      hint: "To speak very softly or quietly, often in a secretive manner.",
    },
    {
      word: "shadow",
      hint: "A dark area or shape produced by an object blocking the light.",
    },
    {
      word: "secret",
      hint: "Something kept hidden or unknown to others.",
    },
    {
      word: "curiosity",
      hint: "A strong desire to know or learn something.",
    },
    {
      word: "unpredictable",
      hint: "Not able to be foreseen or known beforehand; uncertain.",
    },
    {
      word: "obfuscate",
      hint: "To confuse or bewilder someone; to make something unclear or difficult to understand.",
    },
    {
      word: "unveil",
      hint: "To make known or reveal something previously secret or unknown.",
    },
    {
      word: "illusion",
      hint: "A false perception or belief; a deceptive appearance or impression.",
    },
    {
      word: "moonlight",
      hint: "The light from the moon.",
    },
    {
      word: "vibrant",
      hint: "Full of energy, brightness, and life.",
    },
    {
      word: "nostalgia",
      hint: "A sentimental longing or wistful affection for the past.",
    },
    {
      word: "brilliant",
      hint: "Exceptionally clever, talented, or impressive.",
    },
  ];

  const keyRows = [
    "qwertyuiop".split(""),
    "asdfghjkl".split(""),
    "zxcvbnm".split(""),
  ];

  const word = createSignal(
    wordList[Math.floor(Math.random() * wordList.length)]
  );

  const guessLetters = createSignal<string[]>([]);
  const wrongGuesses = createMemo(() => {
    return guessLetters[0]().filter(
      (letter) => !word[0]().word.includes(letter)
    ).length;
  });

  const wordGuessedSoFar = createMemo(() => {
    let toReturn = word[0]().word.split("");
    for (let i = 0; i < toReturn.length; i++) {
      if (!guessLetters[0]().find((letter) => letter === toReturn[i])) {
        toReturn[i] = "_";
      }
    }
    return toReturn.join("");
  });

  const won = createMemo(() => {
    return wordGuessedSoFar() === word[0]().word;
  });

  const lost = createMemo(() => {
    return wrongGuesses() === 6;
  });

  return (
    <>
      <h3>Hangman</h3>
      <div class="hangman-paper">
        <Show when={won()}>
          <div class="modal">You win!</div>
        </Show>
        <Show when={lost()}>
          <div class="modal">You lose.</div>
        </Show>
        <img src={`/hangman-${wrongGuesses()}.svg`} alt="" />
        <div>
          <h1 class="input">{wordGuessedSoFar().split("").join(" ")}</h1>
          <p>Hint: {word[0]().hint}</p>
          <p>
            <b>Incorrect Guesses: {wrongGuesses()} out of 6</b>
          </p>
          <div class="keyboard">
            <For each={keyRows}>
              {(row) => {
                return (
                  <>
                    <div>
                      <For each={row}>
                        {(key) => {
                          return (
                            <button
                              disabled={
                                guessLetters[0]().includes(key) ||
                                won() ||
                                lost()
                              }
                              onClick={() => {
                                guessLetters[1]((v) => {
                                  v.push(key);
                                  return [...v];
                                });
                              }}
                            >
                              <span>{key}</span>
                            </button>
                          );
                        }}
                      </For>
                    </div>
                  </>
                );
              }}
            </For>
          </div>
        </div>
      </div>
    </>
  );
}

function BallJump() {
  const score = createSignal(0);
  const gameOver = createSignal(false);
  const startGame = () => {
    let pole = document.querySelector(".pole")! as HTMLDivElement;
    let gap = document.querySelector(".gap")! as HTMLDivElement;
    let ball = document.querySelector(".ball")! as HTMLDivElement;
    let jumping = false;

    pole.style.animation = "pole 2s infinite linear";

    pole.addEventListener("animationiteration", () => {
      gap.style.top = 100 + Math.round(Math.random() * 100) + "px";
      gap.style.height = 150 + Math.round(Math.random() * 200) + "px";
      score[1]((v) => ++v);
    });

    let bi = setInterval(() => {
      let ballTop = parseInt(
        window.getComputedStyle(ball).getPropertyValue("top")
      );
      if (!jumping) {
        ball.style.top = ballTop + 3 + "px";
      }
      let blockLeft = parseInt(
        window.getComputedStyle(pole).getPropertyValue("left")
      );
      let holeTop = parseInt(
        window.getComputedStyle(gap).getPropertyValue("top")
      );
      let cTop = ballTop;
      if (
        ballTop > 480 ||
        (blockLeft < 20 &&
          blockLeft > -50 &&
          (cTop < holeTop || cTop > holeTop + gap.clientHeight))
      ) {
        clearInterval(bi);
        pole.style.animation = "none";
        gameOver[1](true);
        ball.style.top = 100 + "px";
      }
    }, 10);

    function jump() {
      jumping = true;
      let jumpCount = 0;
      var jumpInterval = setInterval(function () {
        var characterTop = parseInt(
          window.getComputedStyle(ball).getPropertyValue("top")
        );
        if (characterTop > 6 && jumpCount < 15) {
          ball.style.top = characterTop - 5 + "px";
        }
        if (jumpCount > 20) {
          clearInterval(jumpInterval);
          jumping = false;
          jumpCount = 0;
        }
        jumpCount++;
      }, 10);
    }

    function jumpOnSpace(e: KeyboardEvent) {
      if (e.key === "Spacebar" || e.key === " ") {
        jump();
      }
    }
    window.document.body.onkeydown = jumpOnSpace;
  };

  onCleanup(() => {
    window.document.body.onkeydown = () => {};
  });
  onMount(() => {
    window.document.body.onkeydown = (e) => {
      if (e.key === "Enter") {
        startGame();
      }
    };
  });

  return (
    <>
      <h3>Ball Jump</h3>
      <p>Press ENTER to start game. Press SPACE to make the ball jump</p>
      <div class="ball-jump-container">
        <Show when={gameOver[0]()}>
          <div class="modal">Game over. Score: {score[0]()}</div>
        </Show>
        <div class="score">{score[0]()}</div>
        <div class="ball-jump-display">
          <div class="ball"></div>
          <div class="pole">
            <div class="gap"></div>
          </div>
        </div>
      </div>
    </>
  );
}

function Snake() {
  const gameOver = createSignal(false);
  onMount(() => {
    let board = document.querySelector("#snake-board");
    let inputDir = { x: 0, y: 0 };
    let lastPaintTime = 0;
    let snakeArray = [{ x: 6, y: 6 }];
    let food = { x: 6, y: 8 };

    function timeMain(ctime: number) {
      window.requestAnimationFrame(timeMain);
      if ((ctime - lastPaintTime) / 1000 < 1 / 4) return;
      lastPaintTime = ctime;

      gameEngine();
    }
    function isCollide(sarr: typeof snakeArray) {
      for (let i = 1; i < snakeArray.length; i++) {
        if (
          (sarr[i].x === sarr[0].x && sarr[i].y === sarr[0].y) ||
          sarr[0].x > 18 ||
          sarr[0].x < 0 ||
          sarr[0].y > 18 ||
          sarr[0].y < 0
        ) {
          return true;
        }
      }
    }
    function gameEngine() {
      if (isCollide(snakeArray)) {
        inputDir = { x: 0, y: 0 };
        snakeArray = [{ x: 6, y: 6 }];
        gameOver[1](true);
      }
      if (snakeArray[0].x == food.x && snakeArray[0].y == food.y) {
        snakeArray.unshift({
          x: snakeArray[0].x + inputDir.x,
          y: snakeArray[0].y + inputDir.y,
        });
        let a = 2;
        let b = 16;
        food = {
          x: 2 + Math.round(a + (b - a) * Math.random()),
          y: 2 + Math.round(a + (b - a) * Math.random()),
        };
      }
      for (let i = snakeArray.length - 2; i >= 0; i--) {
        snakeArray[i + 1] = { ...snakeArray[i] };
      }
      snakeArray[0].x += inputDir.x;
      snakeArray[0].y += inputDir.y;
      board!.innerHTML = "";
      snakeArray.forEach((e, index) => {
        let snakeElement = document.createElement("div");
        snakeElement.style.gridRowStart = e.y.toString();
        snakeElement.style.gridColumnStart = e.x.toString();

        if (index == 0) {
          snakeElement.classList.add("head");
        } else {
          snakeElement.classList.add("snake");
        }
        board!.appendChild(snakeElement);
      });
      let foodElement = document.createElement("div");
      foodElement.style.gridRowStart = food.y.toString();
      foodElement.style.gridColumnStart = food.x.toString();
      foodElement.classList.add("food");
      board!.appendChild(foodElement);
    }

    window.requestAnimationFrame(timeMain);

    window.addEventListener("keydown", (e) => {
      inputDir = { x: 0, y: 0 };
      switch (e.key) {
        case "ArrowUp":
          console.log("ArrowUp");
          inputDir.x = 0;
          inputDir.y = -1;
          break;
        case "ArrowDown":
          console.log("ArrowDown");
          inputDir.x = 0;
          inputDir.y = 1;
          break;
        case "ArrowLeft":
          console.log("ArrowLeft");
          inputDir.x = -1;
          inputDir.y = 0;
          break;
        case "ArrowRight":
          console.log("ArrowRight");
          inputDir.x = 1;
          inputDir.y = 0;
          break;
        default:
          console.log("Unknown key");
          break;
      }
    });
  });
  return (
    <>
      <h3>Snake</h3>
      <p>Use arrow keys to control the snake.</p>
      <div class="snake-container">
        <div id="snake-board"></div>
        <Show when={gameOver[0]()}>
          <div class="modal">Game over!</div>
        </Show>
      </div>
    </>
  );
}

function TicTacToe() {
  type tictactoesymbol = "✕" | "○";

  const game = createSignal([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]);

  const turn = createSignal<tictactoesymbol>("✕");

  const winner = createMemo<tictactoesymbol | "draw" | undefined>(() => {
    const gameState = game[0]();
    if (gameState.every((row) => row.every((cell) => cell.length > 0)))
      return "draw";

    console.log("gsf");
    for (let i = 0; i < 3; i++) {
      //horizontal
      const row = gameState[i];
      if (row[0] === row[1] && row[1] === row[2]) {
        return row[0] as tictactoesymbol;
      }

      //vertical
      if (
        gameState[0][i] === gameState[1][i] &&
        gameState[1][i] === gameState[2][i]
      ) {
        return gameState[0][i] as tictactoesymbol;
      }
    }

    //diagonal
    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      return gameState[0][0] as tictactoesymbol;
    }

    if (
      gameState[2][0] === gameState[1][1] &&
      gameState[1][1] === gameState[0][2]
    ) {
      return gameState[2][0] as tictactoesymbol;
    }
  });

  return (
    <>
      <h3>Tic Tac Toe</h3>
      <div
        style={{
          "margin-bottom": "1rem",
        }}
      >
        X goes first.
      </div>
      <div class="tic-tac-toe-board-container">
        <Show when={winner()}>
          <Switch>
            <Match when={winner() === "draw"}>
              <div class="modal">It's a draw!</div>
            </Match>
            <Match when={winner() === "✕"}>
              <div class="modal">X wins!</div>
            </Match>
            <Match when={winner() === "○"}>
              <div class="modal">O wins!</div>
            </Match>
          </Switch>
        </Show>
        <div class="tic-tac-toe-board">
          <For each={game[0]()}>
            {(r, i) => {
              return (
                <Index each={r}>
                  {(v, j) => {
                    return (
                      <div
                        onClick={() => {
                          if (v().length > 0) return;

                          game[1]((g) => {
                            g[i()][j] = turn[0]();
                            return [...g].map((r) => [...r]);
                          });
                          turn[1]((v) => {
                            return v === "○" ? "✕" : "○";
                          });
                        }}
                      >
                        {v()}
                      </div>
                    );
                  }}
                </Index>
              );
            }}
          </For>
        </div>
      </div>
    </>
  );
}

function SpinnerWheel() {
  const colors = [
    "red",
    "orange",
    "yellow",
    "greenyellow",

    "yellowgreen",
    "green",
    "teal",
    "blue",
    "darkslateblue",
    "indigo",
    "purple",
    "violet",
    "pink",
    "hotpink",
  ];

  const items = createSignal([
    "Kyler",
    "Ali",
    "Xiao",
    "Pedro",
    "Owen",
    "Vivek",
    "Nala",
    "Freddy",
    "Julie",
    "Muhammad",
    "Ranjha",
    "Ahmed",
  ]);
  const sections = createMemo(() => items[0]().length);

  const sectionSize = createMemo(() => 360 / sections());

  const gradientColors = createMemo(() => {
    let result = "";

    for (let i = 0; i < sections(); i++) {
      const color = colors[i % colors.length];
      result += `${color} ${i * sectionSize()}deg, ${color} ${
        (i + 1) * sectionSize()
      }deg${i === sections() - 1 ? "" : ","}`;
    }
    return result;
  });

  const rotate = createSignal(7);

  const winner = createSignal<number>();

  createEffect(() => {
    if (!items[0]().length) {
      items[1](["New Item"]);
    }
  });

  return (
    <>
      <h3>Spinner Wheel</h3>
      <div class="spinner-container">
        <Show when={winner[0]() !== undefined}>
          <div class="modal">
            We have a winner: {items[0]()[winner[0]()!]}
            <button
              onClick={() => {
                items[1]((v) => [...v.filter((_, i) => i !== winner[0]())]);
                winner[1](undefined);
              }}
            >
              <span>OK</span>
            </button>
          </div>
        </Show>
        <div class="wheel-wrapper">
          <div class="point">▲</div>
          <div
            class="wheel"
            onClick={() => {
              let tickTimeout: any;
              let time = 0;

              function tick() {
                time += 5;
                rotate[1]((v) => v + 7);
                tickTimeout = setTimeout(
                  () => {
                    tick();
                  },
                  time < 2000 ? 5 : time < 3000 ? 10 : 20
                );
              }
              tick();

              setTimeout(() => {
                clearTimeout(tickTimeout);
                const finalAngle = 360 - Math.abs(rotate[0]() % 360);
                const winningSection = Math.floor(finalAngle / sectionSize());
                winner[1](winningSection);
              }, 2000 + Math.random() * 2000);
            }}
            style={{
              background: `conic-gradient(
              ${gradientColors()}
              )`,
              transform: `rotate(${rotate[0]()}deg)`,
              rotate: ``,
            }}
          >
            <For each={items[0]()}>
              {(item, i) => {
                return (
                  <div
                    style={{
                      transform: `rotate(${
                        i() * sectionSize() + 90 + sectionSize() / 2
                      }deg) translateY(-0px)`,
                    }}
                  >
                    {item}
                  </div>
                );
              }}
            </For>
          </div>
        </div>
        <div>
          <div class="spinner-items-list">
            <For each={items[0]()}>
              {(item, i) => {
                return (
                  <>
                    <div>
                      <input
                        onChange={(e) => {
                          items[1]((v) => {
                            v[i()] = e.target.value;
                            return [...v];
                          });
                        }}
                        value={item}
                      />
                      <button
                        onClick={() => {
                          items[1]((v) => {
                            let n: (string | undefined)[] = [...v];
                            n[i()] = undefined;
                            return n.filter((v) => v !== undefined);
                          });
                        }}
                      >
                        <span>✕</span>
                      </button>
                    </div>
                  </>
                );
              }}
            </For>
          </div>
          <button
            id="newitem"
            onClick={() => {
              items[1]((v) => {
                v.push("New Item");
                return [...v];
              });
              document.querySelector(".spinner-items-list")?.scrollTo(0, 10000);
            }}
          >
            <span>New Item</span>
          </button>
        </div>
      </div>
    </>
  );
}

function SnakesAndLadders() {
  interface Snake {
    start: number;
    end: number;
  }
  interface Ladder {
    start: number;
    end: number;
  }
  enum SnakeLadderTurn {
    Human,
    Computer,
  }

  const snakes: Snake[] = [
    {
      start: 98,
      end: 78,
    },
    {
      start: 95,
      end: 75,
    },
    {
      start: 93,
      end: 73,
    },
    {
      start: 86,
      end: 24,
    },
    {
      start: 61,
      end: 19,
    },
    {
      start: 58,
      end: 41,
    },
    {
      start: 47,
      end: 26,
    },
    {
      start: 49,
      end: 11,
    },
  ];

  const ladders: Ladder[] = [
    { start: 80, end: 99 },
    { start: 71, end: 92 },
    { start: 51, end: 73 },
    { start: 28, end: 84 },
    { start: 36, end: 57 },
    { start: 21, end: 42 },
    { start: 20, end: 37 },
    { start: 9, end: 31 },
    { start: 4, end: 14 },
  ];

  let cells: number[] = [];

  for (let i = 10; i > 0; i--) {
    if (i % 2 !== 0) {
      for (let j = 1; j <= 10; j++) {
        cells.push(j + (i - 1) * 10);
      }
    } else {
      for (let j = 10; j > 0; j--) {
        cells.push(j + (i - 1) * 10);
      }
    }
  }

  const humanPawnPos = createSignal(1);
  const computerPawnPos = createSignal(1);

  const humanDieValue = createSignal<dievalue>(1);
  const computerDieValue = createSignal<dievalue>(1);

  const turn = createSignal(SnakeLadderTurn.Human);

  return (
    <>
      <h3>Snakes and Ladders</h3>
      <div class="snakes-ladders-game-container">
        <div class="snakes-ladders-board-container">
          <Show when={humanPawnPos[0]() === 100}>
            <div class="modal">You win!</div>
          </Show>
          <Show when={computerPawnPos[0]() === 100}>
            <div class="modal">Computer wins!</div>
          </Show>
          <div class="snakes-ladders-board">
            <For each={cells}>
              {(cell) => {
                return (
                  <div>
                    <Show when={humanPawnPos[0]() === cell}>
                      <div class="pawn p1"></div>
                    </Show>
                    <Show when={computerPawnPos[0]() === cell}>
                      <div class="pawn p2"></div>
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
        <div>
          <div
            class={
              "player-card " +
              (turn[0]() === SnakeLadderTurn.Human ? "" : "disabled")
            }
          >
            <Show when={turn[0]() === SnakeLadderTurn.Human}>
              <div class="player-card-header">Your turn</div>
            </Show>
            You
            <div class="pawn p1"></div>
            <Die
              value={humanDieValue[0]()}
              onClick={async (newValue) => {
                humanDieValue[1](newValue);
                await move(humanPawnPos, humanDieValue[0]());
                if (humanPawnPos[0]() === 100) {
                  return;
                }

                // Simulate computer taking some time to click
                await wait(500);
                turn[1](SnakeLadderTurn.Computer);
                await wait(500);
                computerDieValue[1](randomDieValue());
                await wait(2000);
                await move(computerPawnPos, computerDieValue[0]());

                if (computerPawnPos[0]() === 100) {
                  return;
                }
                turn[1](SnakeLadderTurn.Human);
              }}
            />
            Click die to roll
          </div>
          <div
            class={
              "player-card " +
              (turn[0]() === SnakeLadderTurn.Computer ? "" : "disabled")
            }
          >
            <Show when={turn[0]() === SnakeLadderTurn.Computer}>
              <div class="player-card-header">Computer's turn</div>
            </Show>
            Computer
            <div class="pawn p2"></div>
            <Die value={computerDieValue[0]()} />
          </div>
        </div>
      </div>
    </>
  );

  async function move(pawnPosSignal: Signal<number>, newDieValue: dievalue) {
    return new Promise<void>(async (resolve) => {
      for (let i = 0; i < newDieValue; i++) {
        pawnPosSignal[1]((v) => {
          v += 1;
          return Math.min(v, 100);
        });
        await wait(400);
      }

      const snake = snakes.find((snake) => snake.start === pawnPosSignal[0]());
      const ladder = ladders.find(
        (ladder) => ladder.start === pawnPosSignal[0]()
      );

      if (snake) {
        await wait(500);
        pawnPosSignal[1](snake.end);
        resolve();
      } else if (ladder) {
        await wait(500);
        pawnPosSignal[1](ladder.end);
        resolve();
      } else {
        resolve();
      }

      if (pawnPosSignal[0]() >= 100) {
        pawnPosSignal[1](100);
      }
    });
  }
}
function Die(props: {
  value: dievalue;
  onClick?: (newValue: dievalue) => Promise<void>;
}) {
  const clickActionRunning = createSignal(false);

  return (
    <div
      style={props.onClick ? "cursor:pointer" : ""}
      class={"die"}
      onClick={(e) => {
        if (props.onClick) {
          if (clickActionRunning[0]()) return;
          clickActionRunning[1](true);
          e.target.classList.add("mystery");
          setTimeout(() => {
            props.onClick?.(randomDieValue());
            e.target.classList.remove("mystery");
            clickActionRunning[1](false);
          }, 500);
        }
      }}
    >
      <Switch>
        <Match when={props.value === 1}>•</Match>
        <Match when={props.value === 2}>••</Match>
        <Match when={props.value === 3}>•••</Match>
        <Match when={props.value === 4}>
          • •<br />
          <br />• •
        </Match>
        <Match when={props.value === 5}>
          • •<br />
          •
          <br />• •
        </Match>
        <Match when={props.value === 6}>
          •••
          <br />
          •••
        </Match>
      </Switch>
    </div>
  );
}

function randomDieValue(): dievalue {
  return Math.ceil(Math.random() * 6) as dievalue;
}

function MemoryMatcher() {
  const PAIRS = ["a", "b", "c", "d", "e", "f", "g", "h"];

  const tiles = scrambleArray([...PAIRS, ...PAIRS]);
  console.log(tiles);
  const matches = createSignal<typeof PAIRS>([]);

  const reveal = createSignal<number[]>([]);

  return (
    <>
      <h3>Memory Matcher</h3>
      <div
        class={
          "match-grid " +
          (matches[0]().length === PAIRS.length ? "allmatch" : "")
        }
      >
        <For each={tiles}>
          {(tile, i) => {
            const isReveal = createMemo(() => {
              return reveal[0]().includes(i());
            });
            const isMatch = createMemo(() => {
              return matches[0]().includes(tile);
            });
            return (
              <div
                style={{
                  "pointer-events": reveal[0]().length === 2 ? "none" : "auto",
                }}
                class={`${isReveal() ? "reveal" : ""} ${
                  isMatch() ? "matched" : ""
                }`}
                onClick={() => {
                  reveal[1]((v) => {
                    v.push(i());
                    return [...v];
                  });
                  if (reveal[0]().length === 2) {
                    const _isMatch =
                      tiles[reveal[0]()[1]] === tiles[reveal[0]()[0]];
                    if (_isMatch) {
                      matches[1]((v) => {
                        v.push(tile);
                        return [...v];
                      });
                      reveal[1]([]);
                    } else {
                      setTimeout(() => {
                        reveal[1]([]);
                      }, 500);
                    }
                  }
                }}
              >
                <Show when={isMatch() || isReveal()} fallback={<>?</>}>
                  {tile}
                </Show>
              </div>
            );
          }}
        </For>
      </div>
    </>
  );
}

interface SortableProps {
  item: { id: string; text: string };
}

const Sortable = (props: SortableProps) => {
  console.log(props.item);
  const sortable = createSortable(props.item.id);
  return (
    <div
      // @ts-ignore
      use:sortable
      class="sortable tile"
      classList={{ dragging: sortable.isActiveDraggable }}
    >
      {props.item.text}
    </div>
  );
};

function SortableList(props: {
  items: { id: string; text: string }[];
  onReorder: (newOrder: { id: string; text: string }[]) => void;
}) {
  const [items, setItems] = createSignal(props.items);

  const ids = () => items().map((item) => item.id);

  const onDragStart = ({}: DragEvent) => {};

  const onDragEnd = ({ draggable, droppable }: DragEvent) => {
    if (draggable && droppable) {
      const currentItems = ids();
      const fromIndex = currentItems.indexOf(draggable.id as string);
      const toIndex = currentItems.indexOf(droppable.id as string);
      if (fromIndex !== toIndex) {
        const updatedItems = [...currentItems];
        updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
        const newOrder = updatedItems.map(
          (item) => props.items.find((itm) => itm.id === item)!
        );
        setItems(newOrder);
        props.onReorder(newOrder);
      }
    }
  };

  return (
    <DragDropProvider
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      collisionDetector={closestCenter}
    >
      <DragDropSensors />
      <div class="draggable-container">
        <SortableProvider ids={ids()}>
          <For each={items()}>{(item) => <Sortable item={item} />}</For>
        </SortableProvider>
      </div>
    </DragDropProvider>
  );
}

async function wait(ms: number) {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
function scrambleArray<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
  }
  return arr;
}
function generateRandomString(length: number) {
  console.log(Math.random().toString(36).substring(2, length));
  return Math.random().toString(36).substring(2, length);
}

export default App;
