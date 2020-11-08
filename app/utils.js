function getNodes(graph) {
  return graph.nodes().map((id) => ({ id, node: graph.node(id) }));
}

function getEdges(graph) {
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
    const fillcolor = d3.color(nodeColourScale(node.value)).formatHex();
    graph.setNode(id, { ...node, fillcolor, style: "filled" });
  });

  // setting all edges thickness
  const edges = getEdges(graph);
  const edgeValueExtent = d3.extent(edges, ({ edge: { value } }) => value);
  const edgeThicknessScale = d3
    .scaleSqrt()
    .domain(edgeValueExtent)
    .range([1, 5]);

  edges.forEach(({ v, w, edge }) => {
    const penwidth = edgeThicknessScale(edge.value);
    graph.setEdge(v, w, { ...edge, penwidth });
  });

  // setting top value edge color and related node shapes
  const edgesTopValue = d3.max(edges, ({ edge: { value } }) => value);
  const { v, w } = edges.find(({ edge: { value } }) => value === edgesTopValue);
  const shape = "box";
  const color = "green";

  graph.setNode(v, { ...graph.node(v), shape });
  graph.setNode(w, { ...graph.node(w), shape });
  graph.setEdge(v, w, { ...graph.edge(v, w), color });

  return graph;
}
