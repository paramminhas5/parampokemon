import type { Metadata } from "next";
import { GameBoot } from "@/components/game/GameBoot";
import { Game } from "@/components/game/Game";
import { PlayBodyClass } from "@/components/game/PlayBodyClass";

export const metadata: Metadata = {
  title: "Play — Param Quest",
  description: "Walk through fifteen years of building. Ten worlds. One save file.",
};

export default function PlayPage() {
  return (
    <>
      <PlayBodyClass />
      <GameBoot>
        <Game />
      </GameBoot>
    </>
  );
}
