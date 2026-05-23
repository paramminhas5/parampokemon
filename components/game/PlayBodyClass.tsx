"use client";
import { useEffect } from "react";

export function PlayBodyClass() {
  useEffect(() => {
    document.body.classList.add("play-mode");
    return () => document.body.classList.remove("play-mode");
  }, []);
  return null;
}
