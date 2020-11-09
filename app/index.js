import { preprocess } from "./utils.js";
import { process as dagreProcess, render as dagreRender } from "./dagre.js";
import {
  process as graphvizProcess,
  render as graphvizRender,
} from "./graphviz.js";

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
