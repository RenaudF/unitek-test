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
    inner.attr("transform", d3.event.transform);
  });
  svg.call(zoom);

  // init zoom to fit
  const svgBCR = svg.node().getBoundingClientRect();
  const gBCR = inner.node().getBoundingClientRect();

  const heightRatio = svgBCR.height / gBCR.height;
  const widthRatio = svgBCR.width / gBCR.width;
  const scaleFactor = 0.9; // to leave some margins on the sides

  const scale = Math.min(heightRatio, widthRatio) * scaleFactor;
  const dx =
    (svgBCR.width - (gBCR.width - (svgBCR.left - gBCR.left)) * scale) / 2;
  const dy =
    (svgBCR.height - (gBCR.height - (svgBCR.top - gBCR.top)) * scale) / 2;

  svg
    .transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity.translate(dx, dy).scale(scale));

  dagreRegisterHandlers();
}
