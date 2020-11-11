export function registerOnClick(svg, idAccessor) {
  idAccessor = idAccessor || ((id) => id);
  svg.selectAll("g.node").on("click", (node) => {
    alert(`you have just clicked on node ${idAccessor(node)}`);
  });
}
