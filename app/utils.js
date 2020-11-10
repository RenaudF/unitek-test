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

export function process({ nodes, edges }) {
  // setting all nodes color gradient
  const nodeValueExtent = d3.extent(nodes, ({ value }) => value);
  const nodeColourScale = d3
    .scaleLinear()
    .domain(nodeValueExtent)
    .range(["blue", "orange"]);

  nodes.forEach(
    (node) => (node.color = d3.color(nodeColourScale(node.value)).formatHex())
  );

  // setting all edges thickness
  const edgeValueExtent = d3.extent(edges, ({ value }) => value);
  const edgeThicknessScale = d3
    .scaleSqrt()
    .domain(edgeValueExtent)
    .range([1, 15]);

  edges.forEach((edge) => (edge.width = edgeThicknessScale(edge.value)));

  // setting top value edge color and related node shapes
  const edgesTopValue = d3.max(edges, ({ value }) => value);
  const topValueEdge = edges.find(({ value }) => value === edgesTopValue);
  topValueEdge.color = "green";
  const { source, target } = topValueEdge;
  [source, target].forEach((node) => (node.shape = "rect"));

  return { nodes, edges };
}
