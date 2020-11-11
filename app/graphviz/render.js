import { registerOnClick } from "../utils/onclick.js";

export function render(graph) {
  const dotString = graphlibDot.write(graph);
  d3.select("#graphviz")
    .graphviz()
    .renderDot(dotString, () => {
      registerOnClick(d3.select("#graphviz svg"), ({ key }) => key);
    });
}
