let xMap = {};
let yMap = {};

let topLine = new Konva.Shape({})
let bottomLine = new Konva.Shape({})
const lineGroup = new Konva.Group({});

function initData(stage, target) {
  xMap = {};
  yMap = {};
  const shapes = stage.find('.rect');

  shapes.forEach((shape) => {
    if (shape === target) {
      return;
    }
    const { x, y, width, height, id } = shape.attrs;

    const x1 = x;
    const y1 = y;
    const x2 = x + width;
    const y2 = y + height;

    for(let i = x1; i <= x2; i++) {
      if (xMap[i] === undefined) {
        xMap[i] = [];
      }
      xMap[i].push({
        id,
        x1,
        y1,
        width,
        height,
        x2,
        y2,
      });
    }

    for(let i = y1; i <= y2; i++) {
      if (yMap[i] === undefined) {
        yMap[i] = [];
      }
      yMap[i].push({
        id,
        x1,
        y1,
        width,
        height,
        x2,
        y2,
      });
    }
  });
}

function initDrag(stage, layer) {
  layer.on('dragstart', (e) => {
    initData(stage, e.target);
  });
  layer.on('dragmove', (e) => {
    const target = e.target;
    const { x, y, width, height } = target.attrs;
    const centerX = Math.round(x + width / 2);
    const centerY = Math.round(y + height / 2);

    const [top, bottom] = calculateX({
      y1: y,
      x1: x,
      centerX, 
      centerY,
      x2: x + width,
      y2: y + height,
    });

    const [left, right] = calculateY({
      y1: y,
      x1: x,
      centerX, 
      centerY,
      x2: x + width,
      y2: y + height,
    });

    const topLine = new Konva.Shape({
      sceneFunc: function (ctx) {
        ctx.moveTo(centerX, y);
        ctx.lineTo(centerX, top?.y2 || 0);
        ctx.strokeShape(this);
      },
      stroke: 'black',
      strokeWidth: 0.5,
      id: 'topLine',
    })
    const topDistance = new Konva.Text({
      x: centerX - 15,
      y: (y + (top?.y2 || 0)) / 2,
      text: Math.round(y - (top?.y2 || 0)),
      width: 30,
      align: 'center',
    });
    
    const bottomLine = new Konva.Shape({
      sceneFunc: function (ctx) {
        ctx.moveTo(centerX, y + height);
        ctx.lineTo(centerX, bottom?.y1 || stage.height());
        ctx.strokeShape(this);
      },
      stroke: 'black',
      strokeWidth: 0.5,
      id: 'bottomLine',
    })
    const bottomDistance = new Konva.Text({
      x: centerX - 15,
      y: (y + height + (bottom?.y1 || stage.height())) / 2,
      text: Math.round((bottom?.y1 || stage.height()) - (y + height)),
      width: 30,
      align: 'center',
    });
    
    const leftLine = new Konva.Shape({
      sceneFunc: function (ctx) {
        ctx.moveTo(x, centerY);
        ctx.lineTo(left?.x2 || 0, centerY);
        ctx.strokeShape(this);
      },
      stroke: 'black',
      strokeWidth: 0.5,
      id: 'leftLine',
    })
    const leftDistance = new Konva.Text({
      x: (x + (left?.x2 || 0)) / 2 - 15,
      y: centerY,
      text: Math.round(x - (left?.x2 || 0)),
      width: 30,
      align: 'center',
    });
    
    const rightLine = new Konva.Shape({
      sceneFunc: function (ctx) {
        ctx.moveTo(x + width, centerY);
        ctx.lineTo(right?.x1 || stage.width(), centerY);
        ctx.strokeShape(this);
      },
      stroke: 'black',
      strokeWidth: 0.5,
      id: 'rightLine',
    })
    const rightDistance = new Konva.Text({
      x: (x + width + (right?.x1 || stage.width())) / 2 - 15,
      y: centerY,
      text: Math.round((right?.x1 || stage.width()) - (x + width)),
      width: 30,
      align: 'center',
    });

    lineGroup.destroyChildren();

    lineGroup.add(
      topLine,
      topDistance,
      bottomLine,
      bottomDistance,
      leftLine,
      leftDistance,
      rightLine,
      rightDistance,
    );

    layer.add(lineGroup);
  });

  layer.on('dragend', () => {
    lineGroup.destroyChildren();
  })
}


/**
 * 计算 x 方向上的图形
 */
function calculateX({ y1, centerX, y2 }) {
  const list = xMap[centerX] || [];
  const listTop = [...list];
  const listBottom = [...list];
  
  let top;
  listTop.sort((a, b) => {
    return b.y2 - a.y2;
  });
  for(let item of listTop) {
    if (item.y2 < y1) {
      top = { ...item };
      break;
    }
  }

  let bottom;
  listBottom.sort((a, b) => {
    return a.y1 - b.y1;
  });
  for(let item of listBottom) {
    if (item.y1 > y2) {
      bottom = { ...item };
      break;
    }
  }

  return [top, bottom];
}

function calculateY({ x1, centerY, x2 }) {
  const list = yMap[centerY] || [];
  const listLeft = [...list];
  const listRight = [...list];
  
  let left;
  listLeft.sort((a, b) => {
    return b.x2 - a.x2;
  });
  for(let item of listLeft) {
    if (item.x2 < x1) {
      left = { ...item };
      break;
    }
  }

  let right;
  listRight.sort((a, b) => {
    return a.x1 - b.x1;
  });
  for(let item of listRight) {
    if (item.x1 > x2) {
      right = { ...item };
      break;
    }
  }

  return [left, right];
}
