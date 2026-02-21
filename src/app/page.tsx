"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { questions } from "./questions";

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

type AppPhase = "password" | "pick" | "lobby" | "game";

export default function Home() {
  const [appPhase, setAppPhase] = useState<AppPhase>("password");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [myPlayer, setMyPlayer] = useState<1 | 2 | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [game, setGame] = useState<GameState | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const api = useCallback(
    async (action: string, extra: Record<string, unknown> = {}) => {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, password, ...extra }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      const data = await res.json();
      setGame(data);
      return data;
    },
    [password]
  );

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/game");
      const data = await res.json();
      setGame(data);
    } catch {
      /* ignore */
    }
  }, []);

  // Start polling once authenticated
  useEffect(() => {
    if (appPhase === "lobby" || appPhase === "game") {
      pollRef.current = setInterval(poll, 1500);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [appPhase, poll]);

  // Auto-advance to game phase when game starts
  useEffect(() => {
    if (game && game.phase !== "lobby" && appPhase === "lobby") {
      setAppPhase("game");
    }
  }, [game, appPhase]);

  const handlePassword = useCallback(async () => {
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", password, name: "__check__", playerNumber: 0 }),
      });
      if (res.status === 401) {
        setPasswordError(true);
        return;
      }
      setPasswordError(false);
      // Fetch current game state
      const stateRes = await fetch("/api/game");
      const state = await stateRes.json();
      setGame(state);
      setAppPhase("pick");
    } catch {
      setPasswordError(true);
    }
  }, [password]);

  const pickPlayer = useCallback(
    async (num: 1 | 2) => {
      setMyPlayer(num);
      setAppPhase("lobby");
      await poll();
    },
    [poll]
  );

  const joinGame = useCallback(async () => {
    if (!nameInput.trim() || !myPlayer) return;
    await api("join", { name: nameInput.trim(), playerNumber: myPlayer });
  }, [nameInput, myPlayer, api]);

  const startGame = useCallback(async () => {
    await api("start");
    setAppPhase("game");
  }, [api]);

  const submitAnswer = useCallback(async () => {
    if (!answerInput.trim()) return;
    await api("answer", { playerNumber: myPlayer, answer: answerInput.trim() });
    setAnswerInput("");
  }, [answerInput, myPlayer, api]);

  const nextQuestion = useCallback(async () => {
    await api("next");
  }, [api]);

  const resetGame = useCallback(async () => {
    await api("reset");
    setAppPhase("lobby");
    setNameInput("");
    setAnswerInput("");
  }, [api]);

  const currentQ =
    game && game.questionOrder.length > 0
      ? questions[game.questionOrder[game.currentQuestion]]
      : "";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* PASSWORD SCREEN */}
        {appPhase === "password" && (
          <div className="text-center space-y-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                300 Questions
              </h1>
              <p className="text-purple-300/70 mt-2 text-sm">About Me</p>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handlePassword()}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/25 transition-all text-center"
              />
              {passwordError && (
                <p className="text-red-400 text-sm">Wrong password. Try again.</p>
              )}
            </div>

            <button
              onClick={handlePassword}
              disabled={!password}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold hover:from-pink-400 hover:to-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              Enter
            </button>
          </div>
        )}

        {/* PICK PLAYER */}
        {appPhase === "pick" && (
          <div className="text-center space-y-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Who are you?
              </h1>
              <p className="text-purple-300/50 mt-2 text-sm">
                Pick your player slot
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => pickPlayer(1)}
                disabled={!!(game && game.player1)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500/20 to-pink-500/10 border border-pink-500/20 text-white font-semibold hover:border-pink-400/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Player 1{game?.player1 ? ` — ${game.player1}` : ""}
              </button>
              <button
                onClick={() => pickPlayer(2)}
                disabled={!!(game && game.player2)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-indigo-500/10 border border-indigo-500/20 text-white font-semibold hover:border-indigo-400/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Player 2{game?.player2 ? ` — ${game.player2}` : ""}
              </button>
            </div>
          </div>
        )}

        {/* LOBBY - Enter name & wait */}
        {appPhase === "lobby" && game && (
          <div className="text-center space-y-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                300 Questions
              </h1>
            </div>

            {/* Name entry if not yet joined */}
            {((myPlayer === 1 && !game.player1) ||
              (myPlayer === 2 && !game.player2)) && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && joinGame()}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/25 transition-all"
                />
                <button
                  onClick={joinGame}
                  disabled={!nameInput.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold hover:from-pink-400 hover:to-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  Join
                </button>
              </div>
            )}

            {/* Waiting room */}
            {((myPlayer === 1 && game.player1) ||
              (myPlayer === 2 && game.player2)) && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div
                    className={`px-4 py-3 rounded-xl border ${
                      game.player1
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-white/5 border-white/10 text-white/30"
                    }`}
                  >
                    P1: {game.player1 || "Waiting..."}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-xl border ${
                      game.player2
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-white/5 border-white/10 text-white/30"
                    }`}
                  >
                    P2: {game.player2 || "Waiting..."}
                  </div>
                </div>

                <button
                  onClick={resetGame}
                  className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-sm hover:bg-white/10 hover:text-white/60 transition-all active:scale-[0.98]"
                >
                  Reset Game
                </button>

                {game.player1 && game.player2 && myPlayer === 1 && (
                  <button
                    onClick={startGame}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold hover:from-pink-400 hover:to-indigo-400 transition-all active:scale-[0.98]"
                  >
                    Start Game
                  </button>
                )}

                {game.player1 && game.player2 && myPlayer === 2 && (
                  <p className="text-white/30 text-sm">
                    Waiting for {game.player1} to start...
                  </p>
                )}

                {!(game.player1 && game.player2) && (
                  <p className="text-white/30 text-sm animate-pulse">
                    Waiting for the other player to join...
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* GAME */}
        {appPhase === "game" && game && (
          <>
            {/* PLAYING */}
            {game.phase === "playing" && (
              <div className="space-y-8">
                <div className="flex justify-between items-center text-xs text-white/30">
                  <span>
                    Question {game.currentQuestion + 1} /{" "}
                    {game.questionOrder.length}
                  </span>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        game.player1Submitted
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/5"
                      }`}
                    >
                      {game.player1}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        game.player2Submitted
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/5"
                      }`}
                    >
                      {game.player2}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <p className="text-xl font-medium text-white/90 leading-relaxed">
                    {currentQ}
                  </p>
                </div>

                {game.activePlayer === myPlayer ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-pink-500/20 to-indigo-500/20 border border-white/10">
                        Your turn!
                      </span>
                    </div>

                    <textarea
                      value={answerInput}
                      onChange={(e) => setAnswerInput(e.target.value)}
                      placeholder="Type your answer..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/25 transition-all resize-none"
                    />

                    <button
                      onClick={submitAnswer}
                      disabled={!answerInput.trim()}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold hover:from-pink-400 hover:to-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                    >
                      Submit Answer
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-white/50">
                      {game.activePlayer === 1
                        ? `${game.player1} is answering...`
                        : `${game.player2} is answering...`}
                    </div>
                    <p className="text-white/20 text-xs animate-pulse">
                      Waiting for their response
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* REVEAL */}
            {game.phase === "reveal" && (
              <div className="space-y-8">
                <div className="text-center text-xs text-white/30">
                  Question {game.currentQuestion + 1} /{" "}
                  {game.questionOrder.length}
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <p className="text-lg font-medium text-white/90 leading-relaxed">
                    {currentQ}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-xl p-5 border border-pink-500/10">
                    <p className="text-pink-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      {game.player1}
                    </p>
                    <p className="text-white/90 leading-relaxed">
                      {game.player1Answer}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 rounded-xl p-5 border border-indigo-500/10">
                    <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      {game.player2}
                    </p>
                    <p className="text-white/90 leading-relaxed">
                      {game.player2Answer}
                    </p>
                  </div>
                </div>

                <button
                  onClick={nextQuestion}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold hover:from-pink-400 hover:to-indigo-400 transition-all active:scale-[0.98]"
                >
                  {game.currentQuestion + 1 >= game.questionOrder.length
                    ? "Finish"
                    : "Next Question"}
                </button>
              </div>
            )}

            {/* FINISHED */}
            {game.phase === "finished" && (
              <div className="text-center space-y-8">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    You made it!
                  </h2>
                  <p className="text-purple-300/70 mt-3">
                    {game.player1} &amp; {game.player2} answered all{" "}
                    {game.questionOrder.length} questions together.
                  </p>
                </div>

                <button
                  onClick={resetGame}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold hover:from-pink-400 hover:to-indigo-400 transition-all active:scale-[0.98]"
                >
                  Play Again
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
