// const CONTROL_POINT_TYPE = {
//   1: 1,
// }


/**
 * 更新墙的划线
 * 一个控制点的情况有三种
 * 1、控制点为开始节点，只存在 next
 * 2、控制点为中间节点，存在 pre 和 next
 * 3、控制点为末尾节点，只存在 pre
 * 
 * @param {*} line - 当前控制点前面的线，若为初始节点则没有线
 * @param {*} point - 当前拖动的控制点
 * @param {*} count - 次数，用来结束循环，一次控制点最多影响 4 条线，3个控制点
 * @returns 
 */
function updateLine(line, point, count = 1) {
  if (count > 3) return;
  // 获取上下的控制点
  const pointPre = point.getAttr('pre');
  const pointNext = point.getAttr('next')

  // 当前节点
  const pointX = point.x();
  const pointY = point.y();

  // 初始化前置节点函数数据
  let pointPreX;
  let pointPreY;
  let pointPreK;
  let pointPreB;
  let pointPreB1;
  let pointPreB2;

  // 初始化后置节点函数数据
  let pointNextX;
  let pointNextY;
  let pointNextK;
  let pointNextB;
  let pointNextB1;
  let pointNextB2;

  if (pointPre) {
    pointPreX = pointPre.x();
    pointPreY = pointPre.y();
    pointPreK = (pointY - pointPreY) / (pointX - pointPreX);
    pointPreB = pointY - pointPreK * pointX;

    // 计算两条直线距离 pointPreB 的距离
    const d = Math.sqrt((pointPreK * WALL_PADDING / 2)**2 + (WALL_PADDING / 2)**2);
    pointPreB1 = pointPreB + d;
    pointPreB2 = pointPreB - d;
  }
  if (pointNext) {
    pointNextX = pointNext.x();
    pointNextY = pointNext.y();
    pointNextK = (pointNextY - pointY) / (pointNextX - pointX);
    pointNextB = pointY - pointNextK * pointX;

    // 计算两条直线距离 pointPreB 的距离
    const d = Math.sqrt((pointNextK * WALL_PADDING / 2)**2 + (WALL_PADDING / 2)**2);
    pointNextB1 = pointNextB + d;
    pointNextB2 = pointNextB - d;
  }

  // 垂直于线的可能 - pre
  const vPointPreK = -1 / pointPreK;
  const vPointPreB1 = pointPreY - vPointPreK * pointPreX;
  const vPointPreB2 = pointY - vPointPreK * pointX;

  // 垂直于线的可能 - next
  const vPointNextK = -1 / pointNextK;
  const vPointNextB1 = pointNextY - vPointNextK * pointNextX;
  const vPointNextB2 = pointY - vPointNextK * pointX;

  if (pointPre && pointNext) { // 第二种情况，存在 pre 和 next
    // 获取夹角的函数式: y = preNextCenterK * x + preNextCenterB
    const th1 = Math.atan(pointPreK) / Math.PI * 180;
    const th2 = Math.atan(pointNextK) / Math.PI * 180;
    const th3 = (th1 + th2) / 2;

    // 角平分线存在两个
    const tempK1 = Math.tan(th3 * Math.PI / 180);
    const tempK2 = -1 / tempK1;
    const tempB1 = pointY - tempK1 * pointX;
    const tempB2 = pointY - tempK2 * pointX;
    // 最终的角平分线斜率
    let preNextCenterK = tempK1;

    console.log(`y=${pointPreK}x+${pointPreB}`);
    console.log(`y=${pointNextK}x+${pointNextB}`);
    console.log(tempK1, tempB1, tempK2, tempB2);

    // y = tempK1·x + tempB1;
    // y = tempK2·x + tempB2;

    const preNextK = (pointNextY - pointPreY) / (pointNextX - pointPreX);
    const preNextB = pointNextY - preNextK * pointNextX;

    const [tempX1, tempY1] = calculatePoint(preNextK, preNextB, tempK1, tempB1);
    const [tempX2, tempY2] = calculatePoint(preNextK, preNextB, tempK2, tempB2);

    const tempPreDistance = Math.sqrt((pointPreX - tempX1)**2 + (pointPreY - tempY1)**2);
    const tempNextDistance = Math.sqrt((pointNextX - tempX1)**2 + (pointNextY - tempY1)**2);

    if (tempPreDistance + tempNextDistance > Math.sqrt((pointPreX - pointNextX)**2) + (pointPreY - pointNextY)**2) {
      preNextCenterK = tempK2;
    }
    console.log(preNextCenterK);
    // 最终的角平分线在 y 轴的坐标
    const preNextCenterB = pointY - preNextCenterK * pointX;

    // 获取当前控制点与 pre 中间的线的坐标
    const [ preX2, preY2 ] = calculatePoint(pointPreK, pointPreB1, preNextCenterK, preNextCenterB);
    const [ preX3, preY3 ] = calculatePoint(pointPreK, pointPreB2, preNextCenterK, preNextCenterB);
    const [ preX1, preY1 ] = calculatePoint(pointPreK, pointPreB1, vPointPreK, vPointPreB1);
    const [ preX4, preY4 ] = calculatePoint(pointPreK, pointPreB2, vPointPreK, vPointPreB1);
    // 修改控制点与 pre 中间的线
    line.points([
      preX1, preY1,
      preX2, preY2,
      preX3, preY3,
      preX4, preY4,
    ])

    // 获取当前控制点与 next 中间的线的坐标
    const [ nextX2, nextY2 ] = calculatePoint(pointNextK, pointNextB1, preNextCenterK, preNextCenterB);
    const [ nextX3, nextY3 ] = calculatePoint(pointNextK, pointNextB2, preNextCenterK, preNextCenterB);
    const [ nextX1, nextY1 ] = calculatePoint(pointNextK, pointNextB1, vPointNextK, vPointNextB1);
    const [ nextX4, nextY4 ] = calculatePoint(pointNextK, pointNextB2, vPointNextK, vPointNextB1);

    // 修改线
    pointNext.getAttr('wall-line').points([
      nextX1, nextY1,
      nextX2, nextY2,
      nextX3, nextY3,
      nextX4, nextY4,
    ])

  }
  // {
  //   // 计算 4 个交点的坐标
  //   console.log(`y = ${pointPreK}x + ${pointPreB1}`);
  //   console.log(`y = ${pointPreK}x + ${pointPreB2}`);
  //   console.log(`y = ${vPointPreK}x + ${vPointPreB1}`);
  //   console.log(`y = ${vPointPreK}x + ${vPointPreB2}`);

  //   const [ x1, y1 ] = calculatePoint(pointPreK, pointPreB1, vPointPreK, vPointPreB1);
  //   const [ x2, y2 ] = calculatePoint(pointPreK, pointPreB1, vPointPreK, vPointPreB2);
  //   const [ x3, y3 ] = calculatePoint(pointPreK, pointPreB2, vPointPreK, vPointPreB2);
  //   const [ x4, y4 ] = calculatePoint(pointPreK, pointPreB2, vPointPreK, vPointPreB1);

  //   line.points([
  //     x1, y1,
  //     x2, y2,
  //     x3, y3,
  //     x4, y4,
  //   ])

  //   console.log(
  //     x1, y1,
  //     x2, y2,
  //     x3, y3,
  //     x4, y4,
  //   );
  // }

  layer.batchDraw();
}

/**
 * 计算两条直线之间的交点
 * @param {*} k1 - 直线 1 斜率
 * @param {*} b1 - 直线 1 与 y 轴交点
 * @param {*} k2 - 直线 2 斜率
 * @param {*} b2 - 直线 2 与 y 轴交点
 * @returns 
 */
function calculatePoint(k1, b1, k2, b2) {
  const x = (b2 - b1) / (k1 - k2);
  const y = k1 * x + b1;

  return [x, y];
}