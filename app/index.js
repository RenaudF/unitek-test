import {
  dagreProcess,
  dagreRegisterHandlers,
  graphvizProcess,
  graphvizRegisterHandlers,
  preprocess,
} from "./utils.js";

d3.text("test.gv")
  .then(graphlibDot.read)
  .then(preprocess)
  .then(dagreProcess)
  .then(dagreRender);

d3.text("test.gv")
  .then(graphlibDot.read)
  .then(preprocess)
  .then(graphvizProcess)
  .then(graphvizRender);

function graphvizRender(graph) {
  const dotString = graphlibDot.write(graph);
  d3.select("#graphviz")
    .graphviz()
    .renderDot(dotString, graphvizRegisterHandlers);
}

function dagreRender(graph) {
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

  // zoom features
  const resetTranslate = () => {
    const svgBCR = svg.node().getBoundingClientRect();
    const gBCR = inner.node().getBoundingClientRect();
    const dx = svgBCR.left + svgBCR.width / 2 - gBCR.left - gBCR.width / 2;
    const dy = svgBCR.top + svgBCR.height / 2 - gBCR.top - gBCR.height / 2;
    const transform = inner.attr("transform");
    const [, scale] = /scale\((.*?)\)/.exec(transform);
    svg.call(
      zoom.transform,
      d3.zoomTransform(inner.node()).translate(dx / scale, dy / scale)
    );
  };

  const resetScale = () => {
    const svgBCR = svg.node().getBoundingClientRect();
    const gBCR = inner.node().getBoundingClientRect();
    const heightRatio = svgBCR.height / gBCR.height;
    const widthRatio = svgBCR.width / gBCR.width;
    const scaleFactor = 0.95; // to leave some margins on the sides
    const scale = Math.min(heightRatio, widthRatio) * scaleFactor;
    svg.call(zoom.transform, d3.zoomTransform(inner.node()).scale(scale));
  };

  resetScale();
  resetTranslate();

  // event handlers
  addEventListener("resize", resetScale);
  dagreRegisterHandlers();
}
