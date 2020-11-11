export function d3Zoom(svg, zoom) {
  const inner = svg.select("g");

  // zoom features
  const resetTranslate = () => {
    const svgBCR = svg.node().getBoundingClientRect();
    const gBCR = inner.node().getBoundingClientRect();
    const dx = svgBCR.left + svgBCR.width / 2 - gBCR.left - gBCR.width / 2;
    const dy = svgBCR.top + svgBCR.height / 2 - gBCR.top - gBCR.height / 2;
    const transform = inner.attr("transform");
    const [, scale] = /scale\((.*?)\)/.exec(transform);
    svg.call(
      zoom.transform,
      d3.zoomTransform(inner.node()).translate(dx / scale, dy / scale)
    );
  };

  const resetScale = () => {
    const svgBCR = svg.node().getBoundingClientRect();
    const gBCR = inner.node().getBoundingClientRect();
    const heightRatio = svgBCR.height / gBCR.height;
    const widthRatio = svgBCR.width / gBCR.width;
    const scaleFactor = 0.95; // to leave some margins on the sides
    const scale = Math.min(heightRatio, widthRatio) * scaleFactor;
    svg.call(zoom.transform, d3.zoomTransform(inner.node()).scale(scale));
  };

  return { resetTranslate, resetScale };
}
