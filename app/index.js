d3.text("test.gv")
  .then(graphlibDot.read)
  .then(preprocess)
  .then(graphlibDot.write)
  .then(console.log);

function preprocess(graph) {
  graph.nodes().forEach((id) => {
    const node = graph.node(id);
    const [, value] = node.label.split("\\n").map((s) => +s.trim());
    graph.setNode(id, { ...node, value });
  });
  graph.edges().forEach(({ v, w }) => {
    const edge = graph.edge(v, w);
    const value = +edge.label;
    graph.setEdge(v, w, { ...edge, value });
  });
  return graph;
}
