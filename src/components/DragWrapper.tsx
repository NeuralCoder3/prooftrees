import { ReactNode, useState } from "react";
import Draggable from "react-draggable";

export type Position = {
  x: number;
  y: number;
};

export type PositionHandler = (last: Position, next: Position) => boolean;

export interface DragWrapperProps<T> {
  posHandler: PositionHandler;
  handleId: string;
  child: T extends ReactNode ? T : never
}

export function DragWrapper<T>({ posHandler, handleId: uuid, child }: DragWrapperProps<T>) {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const updatePosition = (e: any, position: Position) => {
    const abort = posHandler({ x, y }, position);
    if (abort) return;
    setX(position.x);
    setY(position.y);
  };

  return (
    <Draggable
      onStop={(e: any, position: Position) => updatePosition(e, position)}
      handle={`#${uuid}`}
    >
      {child}
    </Draggable>
  );
}
