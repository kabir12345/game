import { NextRequest, NextResponse } from "next/server";

interface GameState {
  phase: "lobby" | "playing" | "reveal" | "finished";
  player1: string;
  player2: string;
  playerCount: number;
  currentQuestion: number;
  player1Answer: string;
  player2Answer: string;
  player1Submitted: boolean;
  player2Submitted: boolean;
  activePlayer: 1 | 2 | null;
  questionOrder: number[];
}

const PASSWORD = "easy";

let gameState: GameState = {
  phase: "lobby",
  player1: "",
  player2: "",
  playerCount: 0,
  currentQuestion: 0,
  player1Answer: "",
  player2Answer: "",
  player1Submitted: false,
  player2Submitted: false,
  activePlayer: null,
  questionOrder: [],
};

function shuffleArray(length: number): number[] {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET() {
  return NextResponse.json(gameState);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, password } = body;

  if (password !== PASSWORD) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  switch (action) {
    case "join": {
      const { name, playerNumber } = body;
      if (!name) {
        return NextResponse.json({ error: "Name required" }, { status: 400 });
      }
      if (playerNumber === 1) {
        gameState.player1 = name;
      } else if (playerNumber === 2) {
        gameState.player2 = name;
      }
      gameState.playerCount = (gameState.player1 ? 1 : 0) + (gameState.player2 ? 1 : 0);
      return NextResponse.json(gameState);
    }

    case "start": {
      if (!gameState.player1 || !gameState.player2) {
        return NextResponse.json({ error: "Need 2 players" }, { status: 400 });
      }
      gameState.phase = "playing";
      gameState.activePlayer = 1;
      gameState.currentQuestion = 0;
      gameState.questionOrder = shuffleArray(100);
      return NextResponse.json(gameState);
    }

    case "answer": {
      const { playerNumber: pn, answer } = body;
      if (pn === 1 && gameState.activePlayer === 1) {
        gameState.player1Answer = answer;
        gameState.player1Submitted = true;
        gameState.activePlayer = 2;
      } else if (pn === 2 && gameState.activePlayer === 2) {
        gameState.player2Answer = answer;
        gameState.player2Submitted = true;
        gameState.phase = "reveal";
        gameState.activePlayer = null;
      } else {
        return NextResponse.json({ error: "Not your turn" }, { status: 400 });
      }
      return NextResponse.json(gameState);
    }

    case "next": {
      if (gameState.currentQuestion + 1 >= gameState.questionOrder.length) {
        gameState.phase = "finished";
      } else {
        gameState.currentQuestion += 1;
        gameState.player1Answer = "";
        gameState.player2Answer = "";
        gameState.player1Submitted = false;
        gameState.player2Submitted = false;
        gameState.phase = "playing";
        gameState.activePlayer = 1;
      }
      return NextResponse.json(gameState);
    }

    case "reset": {
      gameState = {
        phase: "lobby",
        player1: "",
        player2: "",
        playerCount: 0,
        currentQuestion: 0,
        player1Answer: "",
        player2Answer: "",
        player1Submitted: false,
        player2Submitted: false,
        activePlayer: null,
        questionOrder: [],
      };
      return NextResponse.json(gameState);
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
