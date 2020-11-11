export const xy2array = ({ x, y }) => [x, y];
export const getMiddle = (a, b) => ({
  x: a.x + (b.x - a.x) / 2,
  y: a.y + (b.y - a.y) / 2,
});
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
