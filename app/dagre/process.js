import { getEdges, getNodes } from "../utils/graphlibdot.js";

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
