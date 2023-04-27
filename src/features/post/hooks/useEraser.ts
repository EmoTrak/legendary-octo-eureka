import { useCallback, useState } from "react";
import { Coordinate } from "../../../data/type/type";

export const useEraser = (
  ref: React.RefObject<HTMLCanvasElement>,
  action: Function
) => {
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<Coordinate | undefined>(
    undefined
  );
  // canvas에 선긋는 함수
  const eraseLine = (originalMousePosition: Coordinate) => {
    if (ref.current) {
      const canvas: HTMLCanvasElement = ref.current;
      const context = canvas.getContext("2d");

      if (context) {
        context.beginPath();
        context.moveTo(originalMousePosition.x, originalMousePosition.y);
        context.clearRect(
          originalMousePosition.x - 15,
          originalMousePosition.y - 15,
          30,
          30
        );
        context.closePath();
      }
    }
  };

  const startErase = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const coordinates = action(event);
      if (coordinates) {
        setIsErasing(true);
        setMousePosition(coordinates);
      }
    },
    []
  );

  const erase = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (isErasing) {
        const newMousePosition = action(event);
        if (mousePosition && newMousePosition) {
          eraseLine(mousePosition);
          setMousePosition(newMousePosition);
        }
      }
    },
    [isErasing, mousePosition]
  );

  const exitErase = useCallback(() => {
    // setIsPainting(false);
    setIsErasing(false);
  }, []);

  return { startErase, erase, exitErase };
};
