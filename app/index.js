import {
  preprocess,
  process,
  diagonal2square,
  middle as getMiddle,
  xy2array,
} from "./utils.js";

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

  /** invisible nodes used to draw paths */
  const edgeLabelNodes = edges.map((edge) => {
    const { source, target } = edge;
    const circular = source === target;
    return {
      edge,
      circular,
      source: {},
      label: {},
      ...(circular
        ? {
            left: {},
            right: {},
          }
        : {
            middle: {},
            target: {},
          }),
    };
  });

  const labelNodeSimulations = [
    d3
      .forceSimulation([...nodes, ...edgeLabelNodes.map(({ label }) => label)])
      .force("charge", d3.forceManyBody().strength(-100).distanceMax(50))
      .force("collide", d3.forceCollide().radius(10)),
    ...edgeLabelNodes.map((edgeLabelNode) => {
      const { circular, source, label } = edgeLabelNode;
      if (circular) {
        return d3.forceSimulation([source, label]).force(
          "",
          d3
            .forceLink([{ source, target: label }])
            .distance(40)
            .strength(0.5)
        );
      } else {
        const { middle, target } = edgeLabelNode;
        return d3
          .forceSimulation([source, middle, target, label])
          .force("", d3.forceManyBody().strength(-10).distanceMax(1000))
          .force(
            "",
            d3
              .forceLink([{ source: middle, target: label }])
              .distance(20)
              .strength(0.5)
          );
      }
    }),
  ];

  const edgeGroup = svg
    .append("g")
    .attr("stroke-opacity", 0.6)
    .selectAll("path")
    .data(edgeLabelNodes)
    .join("path")
    .attr("d", ({ edge: { source, target } }) =>
      d3.line()([xy2array(source), xy2array(target)])
    )
    .attr("fill", "transparent")
    .attr("stroke", ({ edge: { color } }) => color || "#999")
    .attr("stroke-width", ({ edge: { width } }) => width);

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
    .data(edgeLabelNodes)
    .join("text")
    .text(
      ({
        edge: {
          data: { label },
        },
      }) => label
    );

  simulation.on("tick", () => {
    edgeLabelNodes.forEach((edgeLabelNode) => {
      const { source, label, edge, circular } = edgeLabelNode;
      source.fx = source.x = edge.source.x;
      source.fy = source.y = edge.source.y;
      if (circular) {
        const { left, right } = edgeLabelNode;
        const [[x1, y1], [x2, y2]] = diagonal2square(
          xy2array(source),
          xy2array(label)
        );
        left.x = x1;
        left.y = y1;
        right.x = x2;
        right.y = y2;
      } else {
        const { target, middle } = edgeLabelNode;
        target.fx = target.x = edge.target.x;
        target.fy = target.y = edge.target.y;
        const _middle = getMiddle(source, target);
        middle.x = middle.fx = _middle.x;
        middle.y = middle.fy = _middle.y;
      }
    });

    labelNodeSimulations.forEach((labelSimulation) =>
      labelSimulation.alpha(simulation.alpha()).restart()
    );

    edgeGroup.attr("d", (edgeLabelNode) => {
      const { source, label, circular } = edgeLabelNode;
      if (circular) {
        const { left, right } = edgeLabelNode;
        return d3.line().curve(d3.curveNatural)(
          [source, right, label, left, source].map(xy2array)
        );
      } else {
        const { target } = edgeLabelNode;
        return d3.line().curve(d3.curveNatural)(
          [source, label, target].map(xy2array)
        );
      }
    });

    nodeGroup.attr("cx", ({ x }) => x).attr("cy", ({ y }) => y);
    nodeGroup.attr("x", ({ x }) => x).attr("y", ({ y }) => y);
    nodeLabelGroup.attr("transform", ({ x, y }) => `translate(${x},${y})`);
    edgeLabelGroup
      .attr("x", ({ label }) => label.x)
      .attr("y", ({ label }) => label.y);
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
