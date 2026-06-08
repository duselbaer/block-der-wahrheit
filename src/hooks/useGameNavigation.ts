"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";

export function useGameNavigation() {
  const router = useRouter();
  const game = useGameStore((s) => s.game);

  useEffect(() => {
    if (!game) {
      router.replace("/");
      return;
    }
    if (game.status === "finished") {
      router.replace("/finished");
    } else if (game.status === "setup") {
      router.replace("/game/setup");
    } else {
      router.replace("/game");
    }
  }, [game, router]);

  return game;
}
