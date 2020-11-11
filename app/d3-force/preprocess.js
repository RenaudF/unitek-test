export function preprocess(graph) {
  const nodes = graph.nodes().map((id) => {
    const data = graph.node(id);
    const [, value] = data.label.split("\\n").map((s) => +s.trim());
    return { id, data, value };
  });
  const edges = graph.edges().map(({ v, w }) => {
    const data = graph.edge(v, w);
    const value = +data.label;
    const source = nodes.find(({ id }) => id === v);
    const target = nodes.find(({ id }) => id === w);
    return { source, target, data, value };
  });
  return { nodes, edges };
}
