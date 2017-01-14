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



export const simulate = (bee, flowers) => {

  // reset the remaining pollen
  flowers.forEach(f => f.remain = f.pollen)


  // initial state
  let {x,y,dx,dy} = bee

  // could be a typed array for webgl rendering
  const path = []

  for (var i = 0; i < 120; i++) {

    path.push([x,y])

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



export const render = (ctx, bee, flowers, path) => {

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  ctx.beginPath()
  ctx.fillStyle = '#eee'
  flowers.forEach( flower => {
    ctx.arc(flower.x, flower.y, flower.pollen, 0, Math.PI*2)
  })
  ctx.fill()

  // todo pollen left

  ctx.beginPath()
  ctx.fillStyle = '#f08'
  flowers.forEach( flower => {
    ctx.arc(flower.x, flower.y, flower.remain, 0, Math.PI*2)
  })
  ctx.fill()

  ctx.beginPath()
  ctx.strokeStyle = '#fc0'
  path.forEach( ([x,y]) => {
    ctx.lineTo(x, y)
    ctx.arc(x, y, 1, 0, Math.PI*2)
    ctx.moveTo(x, y)
  })
  ctx.stroke()

}
