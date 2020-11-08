import { preprocess } from "./utils.js";

d3.text("test.gv")
  .then(graphlibDot.read)
  .then(preprocess)
  .then(graphlibDot.write)
  .then(console.log);
