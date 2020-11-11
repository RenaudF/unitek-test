import { getEdges, getNodes } from "./graphlibdot.js";

/** calculates ranges and extremums */
export function viewmodel(graph) {
  const nodes = getNodes(graph);
  const edges = getEdges(graph);
  const nodeValueExtent = d3.extent(nodes, ({ node: { value } }) => value);
  const edgeValueExtent = d3.extent(edges, ({ edge: { value } }) => value);
  const edgesTopValue = d3.max(edges, ({ edge: { value } }) => value);
  const topValueEdge = edges.find(
    ({ edge: { value } }) => value === edgesTopValue
  );
  return { graph, nodeValueExtent, edgeValueExtent, topValueEdge };
}

export function cloneGraph(viewmodel) {
  const { graph } = viewmodel;
  const clone = graphlibDot.read(graphlibDot.write(graph));
  return { ...viewmodel, graph: clone };
}
