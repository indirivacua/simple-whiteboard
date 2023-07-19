import * as React from "react";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "./utils";
import "./styles.css";

const options = {
  size: 32,
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
    taper: 100,
    easing: (t) => t,
    cap: true
  }
};

export default function Example() {
  const [points, setPoints] = React.useState([]);

  function handlePointerDown(e) {
    e.target.setPointerCapture(e.pointerId);
    setPoints([[e.pageX, e.pageY, e.pressure]]);
  }

  function handlePointerMove(e) {
    if (e.buttons !== 1) return;
    setPoints([...points, [e.pageX, e.pageY, e.pressure]]);
  }

  const stroke = getStroke(points, options);
  const pathData = getSvgPathFromStroke(stroke);

  return (
    <svg
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      style={{ touchAction: "none" }}
    >
      {points && <path d={pathData} />}
    </svg>
  );
}
