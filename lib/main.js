const withinCircle = ([px,py], {x,y,r}) =>
 Math.sqrt(Math.pow(px-x, 2) + Math.pow(py-y, 2)) < r


export function nearest(flowers, x, y) {

  let flower, distance = Number.MAX_VALUE

  for (var i = 0; i < flowers.length; i++) {
    const d =
      Math.abs(flowers[i].x - x) +
      Math.abs(flowers[i].y - y)

    if(d < distance) {
      flower = flowers[i]
      distance = d
    }
  }

  return flower

}




export const simulate = (bee, flowers, max = 100, target = {r: 10, x: 0, y: 0}) => {

  // reset the remaining pollen
  flowers.forEach(f => f.remain = f.pollen)


  // initial state
  let {x,y,dx,dy} = bee

  // could be a typed array for webgl rendering
  const path = []


  const hD = target.r * target.r
  function hit(x, y) {
    return Math.pow(target.x-x, 2) + Math.pow(target.y-y, 2) < hD
  }

  for (var i = 0; i < 300; i++) {

    path.push([x,y])

    if(x < 0 || x > max || y < 0 || y > max) {
      return path
    }

    if(hit(x,y)) {
      return path
    }

    x += dx
    y += dy

    // damping
    dx *= 0.99
    dy *= 0.99


    // effect of closest flower

    const flower = nearest(flowers, x, y)

    if(flower) {

      // distance to flower
      var distance = Math.sqrt(
        Math.pow(flower.x - x,2) +
        Math.pow(flower.y - y,2)
      )

      if(distance > 60) {continue}

      //clamp

      if(distance < 2) distance = 2

      // force upon bee
      var force = 1 / (distance * distance)

      // console.log(force)

      //
      force = Math.max(force, 0.001)


      force = force * (flower.remain / flower.pollen)

      dx += force * (flower.x - x) * 3
      dy += force * (flower.y - y) * 3

      // remove the pollen from the flower

      flower.remain -= force * 150

      flower.remain = Math.max(flower.remain, 0)


    }


  }

  return path

}



export const render = (ctx, bee, flowers, path, target) => {

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  ctx.beginPath()
  ctx.fillStyle = '#fff'
  flowers.forEach( flower => {
    ctx.moveTo(flower.x, flower.y)
    ctx.arc(flower.x, flower.y, flower.pollen, 0, Math.PI*2)
  })
  ctx.fill()


  ctx.beginPath()
  ctx.fillStyle = '#3fd89c'
  flowers.forEach( flower => {
    ctx.moveTo(flower.x, flower.y)
    ctx.arc(flower.x, flower.y, flower.remain, 0, Math.PI*2)
  })
  ctx.fill()

  // bee path
  ctx.beginPath()
  ctx.strokeStyle = '#fc0'
  path.forEach( ([x,y]) => {
    ctx.lineTo(x, y)
    ctx.arc(x, y, .75, 0, Math.PI*2)
    ctx.moveTo(x, y)
  })
  ctx.stroke()


  const last = path[path.length-1]
  const hit = withinCircle(last, target)

  // target
  ctx.beginPath()
  ctx.fillStyle = hit ? '#fc0' : '#3f8ed8'
  ctx.arc(target.x, target.y, target.r, 0, Math.PI*2)
  ctx.fill()

}

export const completed = (path, flowers, target) => {

  // are we hitting the end
  const last = path[path.length-1]
  const hit = withinCircle(last, target)


  var total = flowers.reduce(function(memo, f) {
    memo.pollen += f.pollen
    memo.remain += f.remain
    return memo
  }, {pollen:0, remain:0})

  // have we gathered enough
  const collected = (1 - (total.remain / total.pollen)) > 0.6

  // console.log(hit, collected, total)

  return hit && collected

}
