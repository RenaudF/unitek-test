import { getEdges, getNodes } from "../utils/graphlibdot.js";

/** Adds visual dimensions to nodes and edges */
export function process({
  graph,
  nodeValueExtent,
  edgeValueExtent,
  topValueEdge,
}) {
  // setting all nodes color gradient
  const nodes = getNodes(graph);
  const nodeColourScale = d3
    .scaleLinear()
    .domain(nodeValueExtent)
    .range(["blue", "orange"]);

  nodes.forEach(({ id, node }) => {
    const fillcolor = d3.color(nodeColourScale(node.value)).formatHex();
    graph.setNode(id, { ...node, fillcolor, style: "filled" });
  });

  // setting all edges thickness
  const edges = getEdges(graph);
  const edgeThicknessScale = d3
    .scaleSqrt()
    .domain(edgeValueExtent)
    .range([1, 5]);

  edges.forEach(({ v, w, edge }) => {
    const penwidth = edgeThicknessScale(edge.value);
    graph.setEdge(v, w, { ...edge, penwidth });
  });

  // setting top value edge color and related node shapes
  const { v, w } = topValueEdge;
  const shape = "box";
  const color = "green";

  graph.setNode(v, { ...graph.node(v), shape });
  graph.setNode(w, { ...graph.node(w), shape });
  graph.setEdge(v, w, { ...graph.edge(v, w), color });

  return graph;
}
