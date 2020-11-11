import { preprocess } from "./utils/graphlibdot.js";
import {
  process as dagreProcess,
  render as dagreRender,
} from "./dagre/index.js";
import {
  process as graphvizProcess,
  render as graphvizRender,
} from "./graphviz/index.js";
import {
  convertGraph,
  process as d3forceProcess,
  render as d3forceRender,
} from "./d3-force/index.js";
import { cloneGraph, viewmodel } from "./utils/viewmodel.js";

const viewmodelPromise = d3
  .text("test.gv")
  .then(graphlibDot.read)
  .then(preprocess)
  .then(viewmodel);

viewmodelPromise.then(cloneGraph).then(dagreProcess).then(dagreRender);
viewmodelPromise.then(cloneGraph).then(graphvizProcess).then(graphvizRender);
viewmodelPromise.then(convertGraph).then(d3forceProcess).then(d3forceRender);
