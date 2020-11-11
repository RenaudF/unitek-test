import { EDGE_THICKNESS_EXTENT } from "./constants.js";

export function process(viewmodel) {
  const {
    graph: { nodes, edges },
    nodeValueExtent,
    edgeValueExtent,
    topValueEdge,
  } = viewmodel;

  // setting all nodes color gradient
  const nodeColourScale = d3
    .scaleLinear()
    .domain(nodeValueExtent)
    .range(["blue", "orange"]);

  nodes.forEach(
    (node) => (node.color = d3.color(nodeColourScale(node.value)).formatHex())
  );

  // setting all edges thickness
  const edgeThicknessScale = d3
    .scaleSqrt()
    .domain(edgeValueExtent)
    .range(EDGE_THICKNESS_EXTENT);

  edges.forEach((edge) => (edge.width = edgeThicknessScale(edge.value)));

  // setting top value edge color and related node shapes
  edges.find(({ value }) => topValueEdge.edge.value === value).color = "green";
  const { v, w } = topValueEdge;
  [v, w].forEach((id) => (nodes.find((node) => node.id === id).shape = "rect"));

  return { nodes, edges };
}
