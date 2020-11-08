import { preprocess, process } from "./utils.js";

d3.text("test.gv")
  .then(graphlibDot.read)
  .then(preprocess)
  .then(process)
  .then(graphlibDot.write)
  .then((dotString) => d3.select("#graph").graphviz().renderDot(dotString));
