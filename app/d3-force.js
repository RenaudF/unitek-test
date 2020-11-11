import { d3Zoom } from "./utils/d3-zoom.js";
import { registerOnClick } from "./utils/onclick.js";

const xy2array = ({ x, y }) => [x, y];
const getMiddle = (a, b) => ({
  x: a.x + (b.x - a.x) / 2,
  y: a.y + (b.y - a.y) / 2,
});
const diagonal2square = ([x1, y1], [x2, y2]) => {
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

export function render({ nodes, edges }) {
  const svg = d3.select("#d3-force").append("svg");
  const { width, height } = svg.node().getBoundingClientRect();
  svg.attr("width", width).attr("height", height);

  const defs = svg.append("defs");
  d3.cross(["green", "#999"], d3.range(8, 16)).forEach(([color, size]) =>
    defs
      .append("marker")
      .attr("id", `arrow-${color}-${size}`)
      .attr("viewBox", [0, 0, size, size])
      .attr("refX", size / 2)
      .attr("refY", size / 2)
      .attr("markerWidth", size)
      .attr("markerHeight", size)
      .attr("orient", "auto")
      .attr("markerUnits", "userSpaceOnUse")
      .append("path")
      .attr("fill", color)
      .attr("opacity", 0.6)
      .attr(
        "d",
        d3.line()([
          [0, 0],
          [size, size / 2],
          [0, size],
        ])
      )
  );

  const inner = svg.append("g");

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

  const edgeGroup = inner
    .append("g")
    .attr("class", "edges")
    .attr("stroke-opacity", 0.6)
    .selectAll("path")
    .data(edgeLabelNodes)
    .join("path")
    .attr("d", ({ edge: { source, target } }) =>
      d3.line()([xy2array(source), xy2array(target)])
    )
    .attr("fill", "transparent")
    .attr("stroke", ({ edge: { color } }) => color || "#999")
    .attr("stroke-width", ({ edge: { width } }) => width)
    .attr(
      "marker-mid",
      ({ circular, edge: { color, width } }) =>
        circular ||
        `url(#arrow-${color || "#999"}-${Math.floor(Math.max(8, width))})`
    );

  const nodeGroup = inner
    .append("g")
    .attr("class", "nodes")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("g.node")
    .data(nodes)
    .join("g")
    .attr("class", "node")
    .attr("fill", ({ color }) => color)
    .call(drag(simulation));
  nodeGroup.append(({ shape }) => {
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
  });
  nodeGroup.append(({ data: { label } }) => {
    const [id, value] = label.split("\\n").map((s) => s.trim());
    const text = d3.create("svg:text");
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
    return text.node();
  });

  const edgeLabelGroup = inner
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

  function updateEdgeLabelNodes() {
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
  }

  simulation.on("tick", () => {
    updateEdgeLabelNodes();

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

    nodeGroup.attr("transform", ({ x, y }) => `translate(${x},${y})`);
    edgeLabelGroup
      .attr("x", ({ label }) => label.x)
      .attr("y", ({ label }) => label.y);
  });

  // setup zoom behaviour
  const zoom = d3.zoom().on("zoom", function () {
    inner.attr("transform", d3.zoomTransform(inner.node()));
  });
  svg.call(zoom);

  // zoom init
  const { resetScale, resetTranslate } = d3Zoom(svg, zoom);
  d3.range(50).forEach(() => {
    // manually run the simulation before rendering and initiating zoom to have better coordinates
    updateEdgeLabelNodes();
    simulation.tick();
    labelNodeSimulations.forEach((labelNodeSimulation) =>
      labelNodeSimulation.tick()
    );
  });
  requestAnimationFrame(() => {
    resetScale();
    resetTranslate();
  });

  // event handlers
  addEventListener("resize", resetScale);
  registerOnClick(svg, ({ id }) => id);
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
