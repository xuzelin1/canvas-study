// const CONTROL_POINT_TYPE = {
//   1: 1,
// }


// 更新墙
function updateLine(line, point, type) {
  // line.points([obj1.x(), obj1.y(), obj2.x(), obj2.y()]);
  // console.log(line, obj1, obj2);

  // 获取上下的控制点
  const pointPre = point.getAttr('pre');
  const pointNext = point.getAttr('next')

  // let pointPre2 = undefined;
  // let pointNext2 = undefined;

  console.log(pointPre, point, pointNext);

  const pointX = point.x();
  const pointY = point.y();

  let pointPreX;
  let pointPreY;
  let pointPreK;
  let pointPreB;
  let pointPreB1;
  let pointPreB2;

  if (pointPre) {
    pointPreX = pointPre.x();
    pointPreY = pointPre.y();
    pointPreK = (pointY - pointPreY) / (pointX - pointPreX);
    pointPreB = pointY - pointPreK * pointX;

    // 计算两条直线距离 pointPreB 的距离
    const d = Math.sqrt((pointPreK * WALL_PADDING / 2)**2 + (WALL_PADDING / 2)**2);
    pointPreB1 = pointPreB + d;
    pointPreB2 = pointPreB - d;

    console.log(pointY, pointPreY, pointX, pointPreX);
    console.log(`y = ${pointPreK}x + ${pointPreB1}`);
    console.log(`y = ${pointPreK}x + ${pointPreB}`);
    console.log(`y = ${pointPreK}x + ${pointPreB2}`);
  }

  if (pointNext) {

  } else {
    
  }

  layer.batchDraw();
}