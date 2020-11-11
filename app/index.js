import { preprocess } from "./utils/graphlibdot.js";
import { process as dagreProcess, render as dagreRender } from "./dagre.js";
import {
  process as graphvizProcess,
  render as graphvizRender,
} from "./graphviz.js";
import {
  preprocess as d3forcePreprocess,
  process as d3forceProcess,
  render as d3forceRender,
} from "./d3-force.js";

d3.text("test.gv")
  .then(graphlibDot.read)
  .then(preprocess)
  .then(dagreProcess)
  .then(dagreRender);

d3.text("test.gv")
  .then(graphlibDot.read)
  .then(preprocess)
  .then(graphvizProcess)
  .then(graphvizRender);

d3.text("test.gv")
  .then(graphlibDot.read)
  .then(d3forcePreprocess)
  .then(d3forceProcess)
  .then(d3forceRender);
