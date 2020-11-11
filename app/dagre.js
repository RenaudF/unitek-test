import { getEdges, getNodes } from "./utils/graphlibdot.js";
import { d3Zoom } from "./utils/d3-zoom.js";

/** Adds visual dimensions to nodes and edges */
export function process(graph) {
  // setting all nodes color gradient
  const nodes = getNodes(graph);
  const nodeValueExtent = d3.extent(nodes, ({ node: { value } }) => value);
  const nodeColourScale = d3
    .scaleLinear()
    .domain(nodeValueExtent)
    .range(["blue", "orange"]);

  nodes.forEach(({ id, node }) => {
    const style = `fill: ${d3.color(nodeColourScale(node.value)).formatHex()};`;
    const shape = "ellipse";
    graph.setNode(id, { ...node, style, shape });
  });

  // setting all edges thickness
  const edges = getEdges(graph);
  const edgeValueExtent = d3.extent(edges, ({ edge: { value } }) => value);
  const edgeThicknessScale = d3
    .scaleSqrt()
    .domain(edgeValueExtent)
    .range([1, 5]);

  edges.forEach(({ v, w, edge }) => {
    const style = `stroke-width: ${edgeThicknessScale(edge.value)}px;`;
    graph.setEdge(v, w, { ...edge, style });
  });

  // setting top value edge color and related node shapes
  const edgesTopValue = d3.max(edges, ({ edge: { value } }) => value);
  const { v, w } = edges.find(({ edge: { value } }) => value === edgesTopValue);
  const shape = "rect";
  const style = graph.edge(v, w).style + `stroke: green;`;
  const arrowheadStyle = "stroke: green; fill: green;";

  graph.setNode(v, { ...graph.node(v), shape });
  graph.setNode(w, { ...graph.node(w), shape });
  graph.setEdge(v, w, { ...graph.edge(v, w), style, arrowheadStyle });

  return graph;
}

export function registerHandlers() {
  d3.selectAll("#dagre g.node").on("click", (id) => {
    alert(`you have just clicked on node ${id}`);
  });
}

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

  // zoom features
  const { resetScale, resetTranslate } = d3Zoom(svg, zoom);
  resetScale();
  resetTranslate();

  // event handlers
  addEventListener("resize", resetScale);
  registerHandlers();
}
