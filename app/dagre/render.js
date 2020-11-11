import { d3Zoom } from "../utils/d3-zoom.js";
import { registerOnClick } from "../utils/onclick.js";

export function render(graph) {
  // Render the graphlib object using d3
  const dagreD3Render = new dagreD3.render();
  const svg = d3.select("#dagre").append("svg");
  const inner = svg.append("g");
  dagreD3Render(inner, graph);

  // setup zoom behaviour
  const zoom = d3.zoom().on("zoom", function () {
    inner.attr("transform", d3.zoomTransform(inner.node()));
  });
  svg.call(zoom);

  // zoom init
  const { resetScale, resetTranslate } = d3Zoom(svg, zoom);
  resetScale();
  resetTranslate();

  // event handlers
  addEventListener("resize", resetScale);
  registerOnClick(svg);
}
