import * as React from "react";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "./utils";
import "./styles.css";

const options = {
  size: 8,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  easing: (t) => t,
  start: {
    taper: 0,
    easing: (t) => t,
    cap: true
  },
  end: {
    taper: 0,
    easing: (t) => t,
    cap: true
  }
};

export default function Example() {
  const [strokes, setStrokes] = React.useState([]);
  const [currentPoints, setCurrentPoints] = React.useState([]);

  function handlePointerDown(e) {
    e.target.setPointerCapture(e.pointerId);
    setCurrentPoints([[e.pageX, e.pageY, e.pressure]]);
  }

  function handlePointerMove(e) {
    if (e.buttons !== 1) return;
    setCurrentPoints([...currentPoints, [e.pageX, e.pageY, e.pressure]]);
  }

  function handlePointerUp(e) {
    setStrokes([...strokes, currentPoints]);
    setCurrentPoints([]);
  }

  return (
    <svg
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      {strokes.map((strokePoints) => {
        const stroke = getStroke(strokePoints, options);
        const pathData = getSvgPathFromStroke(stroke);
        return <path d={pathData} />;
      })}
      {currentPoints.length > 0 && (
        <path d={getSvgPathFromStroke(getStroke(currentPoints, options))} />
      )}
    </svg>
  );
}
