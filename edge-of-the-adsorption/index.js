/**
 * x1 - 开始坐标 x
 * x2 - 结束坐标 x
 * y1 - 开始坐标 y
 * y2 - 结束坐标 y
 * endX - 门距离终点最近距离的 x 坐标
 * endY - 门距离终点最近距离的 y 坐标
 * rotation - 旋转的角度
 * pointDistance - 开始和结束之间的距离
 */
let lineArr = [];

const DISTANCE_OFFSET = 30;
const DOOR_WIDTH = 90;

function initData(stage) {
  const lines = stage.find('.wall-line');
  lineArr = [];
  lines.forEach((line) => {
    const [x1 = 1, y1 = 1, x2 = 1, y2 = 1] = line.attrs.points;
    const rotation = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI || 0;

    // 计算距离终点长度为门宽度的点坐标（相似三角形）
    const d = Math.cos(rotation * Math.PI / 180) * DOOR_WIDTH;
    const h = Math.sin(rotation * Math.PI / 180) * DOOR_WIDTH;
    const x = x2 - d;
    const y = y2 - h;

    // 计算开始结束之间的距离
    const pointDistance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    lineArr.push({
      x1,
      x2,
      y1,
      y2,
      endX: x,
      endY: y,
      rotation,
      pointDistance,
    })
  });
}

function initDrag(elem) {
  stage.on('mousemove', (e) => {
    if (elem.attrs.positionFix) return;
    const { evt } = e;

    const filter = lineArrDataConfig(e);
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

  stage.on('click', (e) => {
    if (elem.attrs.positionFix) return;
    const filter = lineArrDataConfig(e);
    if (filter.length === 0) {
      // 移除围墙
      const index = elem.parent.children.indexOf(elem);
      elem.parent.children.splice(index, 1);
      return;
    }
    const { x, y, rotation } = filter[0];
    elem.setAttrs({
      x,
      y,
      rotation,
      positionFix: true,
    });
  });
}

function lineArrDataConfig(e) {
  const { evt } = e;

  const list = lineArr.map((lineItem) => {
    return {
      ...getSnappingPosition(
        evt.offsetX,
        evt.offsetY,
        { ...lineItem },
      ),
      rotation: lineItem.rotation,
    };
  });

  // 找出可以吸附的墙的数组，并且按距离排序
  const filter = list.filter((item) => {
    return !item.option.rotationFix;
  }).sort((a, b) => {
    return a.option.distance - b.option.distance;
  });

  return filter;
}

/**
 * 
 * @param {*} x - 当前鼠标 x
 * @param {*} y - 当前鼠标 y
 * @param {*} lineItem - 线段计算后的属性集合
 * @returns 
 */
function getSnappingPosition(x, y, lineItem) {
  const { x1, y1, x2, y2, endX, endY, pointDistance } = lineItem;
  // 计算线段的函数和当前鼠标垂直于线段的函数
  const k1 = (y2 - y1) / (x2 - x1);
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

  // 计算垂直点与开始结束之间的距离
  const pointDistance1 = Math.sqrt((x1 - interPointX) ** 2 + (y1 - interPointY) ** 2);
  const pointDistance2 = Math.sqrt((x2 - interPointX) ** 2 + (y2 - interPointY) ** 2);

  // 不在墙的范围内，让门恢复原状
  if (
    distance > DISTANCE_OFFSET ||
    pointDistance1 + pointDistance2 > pointDistance + DISTANCE_OFFSET
  ) {
    return { x, y, option: { rotationFix: true } };
  }

  // 超过线段，门的位置只能是最远的距离
  if (pointDistance2 <= DOOR_WIDTH) {
    return { x: endX, y: endY, option: { distance, snapSuccess: true } };
  }
  
  const Y = k1 * interPointX + b1;
  const X = interPointX;

  return { x: X, y: Y, option: { distance, snapSuccess: true } };
}
