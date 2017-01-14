(function (exports) {
'use strict';

function nearest(flowers, x, y) {

  var flower, distance = Number.MAX_VALUE;

  for (var i = 0; i < flowers.length; i++) {
    var d =
      Math.abs(flowers[i].x - x) +
      Math.abs(flowers[i].y - y);

    if(d < distance) {
      flower = flowers[i];
      distance = d;
    }
  }

  return flower

}



var simulate = function (bee, flowers, max) {
  if ( max === void 0 ) max = 100;


  // reset the remaining pollen
  flowers.forEach(function (f) { return f.remain = f.pollen; });


  // initial state
  var x = bee.x;
  var y = bee.y;
  var dx = bee.dx;
  var dy = bee.dy;

  // could be a typed array for webgl rendering
  var path = [];

  for (var i = 0; i < 300; i++) {

    path.push([x,y]);

    if(x < 0 || x > max || y < 0 || y > max) {
      return path
    }

    x += dx;
    y += dy;

    // damping
    dx *= 0.99;
    dy *= 0.99;


    // effect of closest flower

    var flower = nearest(flowers, x, y);

    if(flower) {

      // distance to flower
      var distance = Math.sqrt(
        Math.pow(flower.x - x,2) +
        Math.pow(flower.y - y,2)
      );

      if(distance > 60) {continue}

      //clamp

      if(distance < 2) { distance = 2; }

      // force upon bee
      var force = 1 / (distance * distance);

      // console.log(force)

      //
      force = Math.max(force, 0.001);


      force = force * (flower.remain / flower.pollen);

      dx += force * (flower.x - x) * 3;
      dy += force * (flower.y - y) * 3;

      // remove the pollen from the flower

      flower.remain -= force * 150;

      flower.remain = Math.max(flower.remain, 0);


    }


  }

  return path

};



var render = function (ctx, bee, flowers, path) {

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.beginPath();
  ctx.fillStyle = '#eee';
  flowers.forEach( function (flower) {
    ctx.moveTo(flower.x, flower.y);
    ctx.arc(flower.x, flower.y, flower.pollen, 0, Math.PI*2);
  });
  ctx.fill();


  ctx.beginPath();
  ctx.fillStyle = '#f08';
  flowers.forEach( function (flower) {
    ctx.moveTo(flower.x, flower.y);
    ctx.arc(flower.x, flower.y, flower.remain, 0, Math.PI*2);
  });
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = '#fc0';
  path.forEach( function (ref) {
    var x = ref[0];
    var y = ref[1];

    ctx.lineTo(x, y);
    ctx.arc(x, y, .75, 0, Math.PI*2);
    ctx.moveTo(x, y);
  });
  ctx.stroke();

};

exports.nearest = nearest;
exports.simulate = simulate;
exports.render = render;

}((this.jotbb = this.jotbb || {})));
