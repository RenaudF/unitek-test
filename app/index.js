import { preprocess } from "./utils.js";

d3.text("test.gv").then(graphlibDot.read).then(preprocess).then(render);

function render({ nodes, edges }) {
  const svg = d3.select("svg#graph");
  const { width, height } = svg.node().getBoundingClientRect();
  svg.attr("width", width).attr("height", height);

  const simulation = d3
    .forceSimulation(nodes, ({ id }) => id)
    .force(
      "edge",
      d3
        .forceLink(edges)
        .id(({ id }) => id)
        .distance(150)
        .strength(0.2)
    )
    .force("collide", d3.forceCollide().radius(30))
    .force("charge", d3.forceManyBody().strength(-1000).distanceMax(400))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const edgeGroup = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(edges)
    .join("line")
    .attr("stroke-width", ({ value }) => Math.sqrt(value));

  const nodeGroup = svg
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 25)
    .attr("fill", "blue")
    .call(drag(simulation));

  nodeGroup.append("title").text(({ node: { label } }) => label);

  simulation.on("tick", () => {
    edgeGroup
      .attr("x1", ({ source: { x } }) => x)
      .attr("y1", ({ source: { y } }) => y)
      .attr("x2", ({ target: { x } }) => x)
      .attr("y2", ({ target: { y } }) => y);

    nodeGroup.attr("cx", ({ x }) => x).attr("cy", ({ y }) => y);
  });
}

function drag(simulation) {
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
