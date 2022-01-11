// const CONTROL_POINT_TYPE = {
//   1: 1,
// }

let COUNT = 0;
let group;

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
  if (count > 2) return;
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
    // 先更新 next 跟 pre
    updateLine(pointPre.getAttr('wall-line'), pointPre, count+1);
    updateLine(pointNext.getAttr('wall-line'), pointNext, count+1);

    const { preNextCenterK, preNextCenterB } = getAngleBisector(
      pointX, pointY,
      pointPreX, pointPreY,
      pointNextX, pointNextY,
      pointPreK, pointNextK,
    );

    // 获取当前控制点与 pre 中间的线的坐标
    const [ preX2, preY2 ] = calculatePoint(pointPreK, pointPreB1, preNextCenterK, preNextCenterB);
    const [ preX3, preY3 ] = calculatePoint(pointPreK, pointPreB2, preNextCenterK, preNextCenterB);
    const [ preX1, preY1 ] = calculatePoint(pointPreK, pointPreB1, vPointPreK, vPointPreB1);
    const [ preX4, preY4 ] = calculatePoint(pointPreK, pointPreB2, vPointPreK, vPointPreB1);

    // const linePoints = [];
    const preLine = pointPre.getAttr('wall-line');
    if (preLine) {
      console.log(preLine);
      const linePoints = preLine?.points() || [];
      // console.log(point.id());
      // console.log(nextLine, pointNext.getAttr('wall-line'));
      // console.log(nextLine.points(), pointNext.getAttr('wall-line').points());
      if (pointPre.getAttr('pre') && linePoints.length !== 0 && count === 1) {
        const [
          preX1_1, preY1_1,
          preX2_1, preY2_1, 
          preX3_1, preY3_1,
          preX4_1, preY4_1
        ] = linePoints;
        // 修改控制点与 pre 中间的线
        preLine.points([
          preX1, preY1,
          preX2, preY2,
          preX3, preY3,
          preX4, preY4,
        ])
      } else {
        preLine.points([
          preX1, preY1,
          preX2, preY2,
          preX3, preY3,
          preX4, preY4,
        ])
      }
    }

    // 获取当前控制点与 next 中间的线的坐标
    const [ nextX2, nextY2 ] = calculatePoint(pointNextK, pointNextB1, preNextCenterK, preNextCenterB);
    const [ nextX3, nextY3 ] = calculatePoint(pointNextK, pointNextB2, preNextCenterK, preNextCenterB);
    const [ nextX1, nextY1 ] = calculatePoint(pointNextK, pointNextB1, vPointNextK, vPointNextB1);
    const [ nextX4, nextY4 ] = calculatePoint(pointNextK, pointNextB2, vPointNextK, vPointNextB1);

    const nextLine = pointNext.getAttr('wall-line');
    // const nextLinePoints = [];
    const nextLinePoints = nextLine.points();
    console.log(point.id());
    console.log(nextLine, pointNext.getAttr('wall-line'));
    console.log(nextLine.points(), pointNext.getAttr('wall-line').points());
    if (pointNext.getAttr('next') && nextLinePoints.length !== 0 && count === 1) {
      const [
        nextX1_1, nextY1_1,
        nextX2_1, nextY2_1,
        nextX3_1, nextY3_1,
        nextX4_1, nextY4_1,
      ] = nextLinePoints;
      // 修改线
      nextLine.points([
        nextX1, nextY1,
        nextX2, nextY2,
        nextX3, nextY3,
        nextX4, nextY4,

        // nextX3, nextY3,
        // nextX2_1, nextY2_1,
        // nextX3_1, nextY3_1,
        // nextX2, nextY2,
      ])
    } else {
      nextLine.points([
        nextX1, nextY1,
        nextX2, nextY2,
        nextX3, nextY3,
        nextX4, nextY4,
      ])
    }
    // console.log('nextLinePoints', nextLinePoints);
  } else if (pointNext && !pointPre) {
    const nextLine = pointNext.getAttr('wall-line');
    updateLine(nextLine, pointNext, count+1);
  } else if (!pointNext && pointPre) {
    const preLine = pointPre.getAttr('wall-line');
    updateLine(preLine, pointPre, count+1);
  }

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

/**
 * 计算出来三个节点的夹角的函数 K 和 B
 * @param {*} pointX 公共点 x
 * @param {*} pointY 公共点 y
 * @param {*} pointPreX 前置节点 x
 * @param {*} pointPreY 前置节点 y
 * @param {*} pointNextX 后置节点 x
 * @param {*} pointNextY 后置节点 y
 * @param {*} pointPreK 公共点与前置节点斜率
 * @param {*} pointNextK 公共点与后置节点斜率
 * @returns 
 */
function getAngleBisector(pointX, pointY, pointPreX, pointPreY, pointNextX, pointNextY, pointPreK, pointNextK) {
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

    const preNextK = (pointNextY - pointPreY) / (pointNextX - pointPreX);
    const preNextB = pointNextY - preNextK * pointNextX;

    const [tempX1, tempY1] = calculatePoint(preNextK, preNextB, tempK1, tempB1);
    const [tempX2, tempY2] = calculatePoint(preNextK, preNextB, tempK2, tempB2);

    const tempPreDistance1 = Math.sqrt((pointPreX - tempX1)**2 + (pointPreY - tempY1)**2);
    const tempNextDistance1 = Math.sqrt((pointNextX - tempX1)**2 + (pointNextY - tempY1)**2);
    const tempPreDistance2 = Math.sqrt((pointPreX - tempX2)**2 + (pointPreY - tempY2)**2);
    const tempNextDistance2 = Math.sqrt((pointNextX - tempX2)**2 + (pointNextY - tempY2)**2);

    // 判断选取哪个角平分线
    if (tempPreDistance1 + tempNextDistance1 > tempPreDistance2 + tempNextDistance2) {
      preNextCenterK = tempK2;
    }

    // 最终的角平分线在 y 轴的坐标
    const preNextCenterB = pointY - preNextCenterK * pointX;

    return {
      preNextCenterK,
      preNextCenterB,
    }
}