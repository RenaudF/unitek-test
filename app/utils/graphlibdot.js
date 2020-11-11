export function getNodes(graph) {
  return graph.nodes().map((id) => ({ id, node: graph.node(id) }));
}

export function getEdges(graph) {
  return graph.edges().map(({ v, w }) => ({ v, w, edge: graph.edge(v, w) }));
}

/** Extract values from nodes and edges labels */
export function preprocess(graph) {
  getNodes(graph).forEach(({ id, node }) => {
    const [, value] = node.label.split("\\n").map((s) => +s.trim());
    graph.setNode(id, { ...node, value });
  });
  getEdges(graph).forEach(({ v, w, edge }) => {
    const value = +edge.label;
    graph.setEdge(v, w, { ...edge, value });
  });
  return graph;
}
