/** converts 2D point from {x,y} to [x,y] format */
export const xy2array = ({ x, y }) => [x, y];

/** returns the middle point between 2 points in {x, y} format */
export const getMiddle = (a, b) => ({
  x: a.x + (b.x - a.x) / 2,
  y: a.y + (b.y - a.y) / 2,
});

/** given 2 points in [x,y] format, returns 2 other points to make a square, using input line as diagonal */
export const diagonal2square = ([x1, y1], [x2, y2]) => {
  const xc = (x1 + x2) / 2,
    yc = (y1 + y2) / 2; // Center point
  const xd = (x1 - x2) / 2,
    yd = (y1 - y2) / 2; // Half-diagonal
  const x3 = xc - yd,
    y3 = yc + xd; // Third corner
  const x4 = xc + yd,
    y4 = yc - xd; // Fourth corner
  return [
    [x3, y3],
    [x4, y4],
  ];
};

/** factory for drag event handler */
export function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.fx = event.x;
    event.fy = event.y;
  }

  function dragged(event) {
    event.fx = d3.event.x;
    event.fy = d3.event.y;
  }

  function dragended(event) {
    simulation.alphaTarget(0);
    event.fx = null;
    event.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

/** converts from graphlibdot to d3 graph format */
export function convertGraph(viewmodel) {
  const { graph } = viewmodel;
  const nodes = graph.nodes().map((id) => {
    const data = graph.node(id);
    return { id, ...data };
  });
  const edges = graph.edges().map(({ v, w }) => {
    const data = graph.edge(v, w);
    const source = nodes.find(({ id }) => id === v);
    const target = nodes.find(({ id }) => id === w);
    return { source, target, ...data };
  });
  return { ...viewmodel, graph: { nodes, edges } };
}
