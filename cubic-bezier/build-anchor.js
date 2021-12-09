// function to build anchor point
function buildAnchor(x, y, text) {
  const anchor = new Konva.Circle({
    x: x,
    y: y,
    radius: 5,
    stroke: '#666',
    fill: '#ddd',
    strokeWidth: 2,
    draggable: true,
  });
  layer.add(anchor);

  const pointText = new Konva.Text({
    x,
    y,
    text,
    fontSize: 16,
    fontFamily: 'Calibri',
    fill: 'black',
  });
  layer.add(pointText);

  // add hover styling
  anchor.on('mouseover', function () {
    document.body.style.cursor = 'pointer';
    this.strokeWidth(4);
  });
  anchor.on('mouseout', function () {
    document.body.style.cursor = 'default';
    this.strokeWidth(2);
  });

  anchor.on('dragmove', function () {
    updateDottedLines();
  });

  return [anchor, pointText];
}