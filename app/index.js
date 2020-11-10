import { preprocess, process } from "./utils.js";

d3.text("test.gv")
  .then(graphlibDot.read)
  .then(preprocess)
  .then(process)
  .then(render);

function render({ nodes, edges }) {
  const svg = d3.select("svg#graph");
  const { width, height } = svg.node().getBoundingClientRect();
  svg.attr("width", width).attr("height", height);

  const simulation = d3
    .forceSimulation(nodes, ({ id }) => id)
    .force("edge", d3.forceLink(edges).distance(150).strength(0.2))
    .force("collide", d3.forceCollide().radius(30))
    .force("charge", d3.forceManyBody().strength(-1000).distanceMax(400))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const edgeGroup = svg
    .append("g")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(edges)
    .join("line")
    .attr("stroke", ({ color }) => color || "#999")
    .attr("stroke-width", ({ width }) => width);

  const nodeGroup = svg
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle, rect")
    .data(nodes)
    .join((enter) =>
      enter.append(({ shape }) => {
        switch (shape) {
          case "rect":
            return d3
              .create("svg:rect")
              .attr("width", 60)
              .attr("height", 40)
              .attr("transform", "translate(-30, -20)")
              .node();
          default:
            return d3.create("svg:circle").attr("r", 25).node();
        }
      })
    )
    .attr("fill", ({ color }) => color)
    .call(drag(simulation));

  nodeGroup.append("title").text(({ data: { label } }) => label);

  const nodeLabelGroup = svg
    .append("g")
    .attr("class", "nodeLabels")
    .selectAll("text")
    .data(nodes)
    .join((enter) =>
      enter.append(({ data: { label } }) => {
        const [id, value] = label.split("\\n").map((s) => s.trim());
        const g = d3.create("svg:g");
        const text = g.append("text");
        text
          .append("tspan")
          .text(id)
          .attr("x", 0)
          .attr("text-anchor", "middle")
          .attr("dy", "-2px");
        text
          .append("tspan")
          .text(value)
          .attr("x", 0)
          .attr("text-anchor", "middle")
          .attr("dy", "1em");
        return g.node();
      })
    );

  const edgeLabelGroup = svg
    .append("g")
    .attr("class", "edgeLabels")
    .selectAll("text")
    .data(edges)
    .join("text")
    .text(({ data: { label } }) => label);

  simulation.on("tick", () => {
    edgeGroup
      .attr("x1", ({ source: { x } }) => x)
      .attr("y1", ({ source: { y } }) => y)
      .attr("x2", ({ target: { x } }) => x)
      .attr("y2", ({ target: { y } }) => y);

    nodeGroup.attr("cx", ({ x }) => x).attr("cy", ({ y }) => y);
    nodeGroup.attr("x", ({ x }) => x).attr("y", ({ y }) => y);
    nodeLabelGroup.attr("transform", ({ x, y }) => `translate(${x},${y})`);
    edgeLabelGroup
      .attr("x", ({ source, target }) => (source.x + target.x) / 2)
      .attr("y", ({ source, target }) => (source.y + target.y) / 2);
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
