export function preprocess(graph) {
  const nodes = graph.nodes().map((id) => {
    const node = graph.node(id);
    const [, value] = node.label.split("\\n").map((s) => +s.trim());
    return { id, node, value };
  });
  const edges = graph.edges().map(({ v, w }) => {
    const edge = graph.edge(v, w);
    const value = +edge.label;
    return { source: v, target: w, edge, value };
  });
  return { nodes, edges };
}
