"use client";

import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

const GRID = 16;

function snap(value: number): number {
  return Math.round(value / GRID) * GRID;
}

type Position = { x: number; y: number };

export function useDraggable(
  initial: Position,
  boundsRef: React.RefObject<HTMLElement | null>,
  widgetSize: { width: number; height: number }
) {
  const reducedMotion = useReducedMotion();
  const [position, setPosition] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; posX: number; posY: number } | null>(
    null
  );

  const clamp = useCallback(
    (x: number, y: number): Position => {
      const bounds = boundsRef.current;
      if (!bounds) return { x, y };
      const rect = bounds.getBoundingClientRect();
      const maxX = rect.width - widgetSize.width;
      const maxY = rect.height - widgetSize.height;
      return {
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY)),
      };
    },
    [boundsRef, widgetSize.width, widgetSize.height]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y,
      };
      setDragging(true);
    },
    [position.x, position.y]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const next = clamp(dragStart.current.posX + dx, dragStart.current.posY + dy);
      setPosition(next);
    },
    [clamp]
  );

  const onPointerUp = useCallback(() => {
    if (!dragStart.current) return;
    dragStart.current = null;
    setDragging(false);
    setPosition((prev) => {
      const snapped = clamp(snap(prev.x), snap(prev.y));
      return snapped;
    });
  }, [clamp]);

  return {
    position,
    dragging,
    reducedMotion,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
