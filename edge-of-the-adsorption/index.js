let lineArr = [];


function initData(stage) {
  const lines = stage.find('.wall-line');
  lineArr = [];
  lines.forEach((line) => {
    const [x1 = 1, y1 = 1, x2 = 1, y2 = 1] = line.attrs.points;
    const rotation = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI || 0;
    lineArr.push({
      x1,
      x2,
      y1,
      y2,
      rotation,
    })
  });
}

function initDrag(elem) {
  stage.on('mousemove', (e) => {
    const { evt } = e;

    const list = lineArr.map((lineItem) => {
      const { x1, y1, x2, y2 } = lineItem;
      return {
        ...getSnappingPosition(
          evt.offsetX,
          evt.offsetY,
          {
            x1,
            y1,
            x2,
            y2,
          }
        ),
        rotation: lineItem.rotation,
      };
    });
    console.log('===', list);
    const filter = list.filter((item) => {
      return !item.option.rotationFix;
    });

    console.log(filter);

    
    if (filter.length === 0) {
      elem.setAttrs({
        x: evt.offsetX,
        y: evt.offsetY,
        rotation: 0,
      });
      return;
    }
    const { x, y, rotation } = filter[0];
    elem.setAttrs({
      x,
      y,
      rotation,
    });
  });

  layer.on('click', (e) => {
    const { option } = this.getSnappingPosition(
      e.evt.offsetX,
      e.evt.offsetY,
      {
        x1,
        y1,
        x2,
        y2,
      }
    );
    if (!option.snapSuccess) {
      this.elem.remove();
    }

    this.wallComponents = {
      elem: {},
      drawing: false,
    };
  });
}

/**
 * 
 * @param {*} x - 当前鼠标 x
 * @param {*} y - 当前鼠标 y
 * @param {*} param2 - 线的点
 * @returns 
 */
function getSnappingPosition(x, y, { x1, y1, x2, y2 }) {
  // console.log(x1, x, x2, y1, y, y2);
  // if (x >= x1 && x <= x2) {
  //   return { x, y };
  // }
  const k1 = (y1 - y2) / (x1 - x2);
  const b1 = y2 - k1 * x2;
  const k2 = -1 / k1;
  const b2 = y - k2 * x;

  const A1 = -k1;
  const B1 = 1;
  const C1 = -b1;

  // 获取点垂直线的交点坐标
  const interPointX = (b2 - b1) / (k1 - k2);
  const interPointY = k1 * interPointX + b1;

  // 获取点与线的距离
  const distance =
    Math.abs(A1 * x + B1 * y + C1) / Math.sqrt(A1 ** 2 + B1 ** 2);
  if (distance > 30) {
    return { x, y, option: { rotationFix: true } };
  }

  const Y = k1 * interPointX + b1;
  const X = interPointX;

  // console.log(`y1 = ${k1}·x1 + ${b1}`);
  // console.log(`y2 = ${k2}·x2 + ${b2}`);
  // console.log('x, y', x, y);
  // console.log('interPoint', interPointX, interPointY);

  return { x: X, y: Y, option: { snapSuccess: true } };
}

