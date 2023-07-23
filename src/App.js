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
  const [mode, setMode] = React.useState("drawing");
  const [selectedStrokeIndex, setSelectedStrokeIndex] = React.useState(null);
  const [panPosition, setPanPosition] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);

  function handlePointerDown(e) {
    e.target.setPointerCapture(e.pointerId);
    if (e.button === 1) {
      setIsPanning(true);
    } else if (mode === "drawing") {
      setCurrentPoints([[e.pageX - panPosition.x, e.pageY - panPosition.y, e.pressure]]);
      setSelectedStrokeIndex(null);
    } else if (mode === "selecting") {
      const clickedX = e.pageX;
      const clickedY = e.pageY;
      let closestDistance = Infinity;
      let closestStrokeIndex = null;
      strokes.forEach((strokePoints, strokeIndex) => {
        strokePoints.forEach(([x, y]) => {
          const distance = Math.sqrt(
            Math.pow(clickedX - x - panPosition.x, 2) + Math.pow(clickedY - y - panPosition.y, 2)
          );
          if (distance < closestDistance) {
            closestDistance = distance;
            closestStrokeIndex = strokeIndex;
          }
        });
      });
      setSelectedStrokeIndex(closestStrokeIndex);
    }
  }

  function handlePointerMove(e) {
    if (isPanning) {
      setPanPosition((prevPanPosition) => ({
        x: prevPanPosition.x + e.movementX,
        y: prevPanPosition.y + e.movementY
      }));
    }
    if (e.buttons !== 1 || mode !== "drawing") return;
    setCurrentPoints([...currentPoints, [e.pageX - panPosition.x, e.pageY - panPosition.y, e.pressure]]);
  }

  function handlePointerUp(e) {
    if (isPanning) {
      setIsPanning(false);
    } else if (mode === "drawing") {
      setStrokes([...strokes, currentPoints]);
      setCurrentPoints([]);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Delete" && selectedStrokeIndex !== null && mode === "selecting") {
      setStrokes(strokes.filter((_, i) => i !== selectedStrokeIndex));
      setSelectedStrokeIndex(null);
    }
  }

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <button
        onClick={() => {
          setMode(mode === "drawing" ? "selecting" : "drawing");
          if (mode === "selecting") {
            setSelectedStrokeIndex(null);
          }
        }}
        style={{
          position: "absolute",
          zIndex: "2",
          left: "10px",
          bottom: "10px",
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        {mode === "drawing" ? "Cambiar a seleccionar" : "Cambiar a dibujar"}
      </button>
      {mode === 'selecting' && (
        <p style={{ position: 'absolute', zIndex: '2', left: '10px', bottom: '50px' }}>
          Usa <kbd>Del</kbd> para borrar
        </p>
      )}
      <svg
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: "none" }}
        viewBox={`${-panPosition.x} ${-panPosition.y} ${window.innerWidth} ${window.innerHeight}`}
      >
        {strokes.map((strokePoints, i) => {
          const stroke = getStroke(strokePoints, options);
          const pathData = getSvgPathFromStroke(stroke);
          return (
            <path
              d={pathData}
              style={{
                stroke: i === selectedStrokeIndex ? "red" : "black"
              }}
            />
          );
        })}
        {currentPoints.length > 0 && (
          <path d={getSvgPathFromStroke(getStroke(currentPoints, options))} />
        )}
      </svg>
    </>
  );
}
