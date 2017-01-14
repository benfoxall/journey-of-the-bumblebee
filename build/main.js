(function (exports) {
'use strict';

var withinCircle = function (ref, ref$1) {
   var px = ref[0];
   var py = ref[1];
   var x = ref$1.x;
   var y = ref$1.y;
   var r = ref$1.r;

   return Math.sqrt(Math.pow(px-x, 2) + Math.pow(py-y, 2)) < r;
};


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




var simulate = function (bee, flowers, max, target) {
  if ( max === void 0 ) max = 100;
  if ( target === void 0 ) target = {r: 10, x: 0, y: 0};


  // reset the remaining pollen
  flowers.forEach(function (f) { return f.remain = f.pollen; });


  // initial state
  var x = bee.x;
  var y = bee.y;
  var dx = bee.dx;
  var dy = bee.dy;

  // could be a typed array for webgl rendering
  var path = [];


  var hD = target.r * target.r;
  function hit(x, y) {
    return Math.pow(target.x-x, 2) + Math.pow(target.y-y, 2) < hD
  }

  for (var i = 0; i < 300; i++) {

    path.push([x,y]);

    if(x < 0 || x > max || y < 0 || y > max) {
      return path
    }

    if(hit(x,y)) {
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



var render = function (ctx, bee, flowers, path, target) {

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.beginPath();
  ctx.fillStyle = '#fff';
  flowers.forEach( function (flower) {
    ctx.moveTo(flower.x, flower.y);
    ctx.arc(flower.x, flower.y, flower.pollen, 0, Math.PI*2);
  });
  ctx.fill();


  ctx.beginPath();
  ctx.fillStyle = '#3fd89c';
  flowers.forEach( function (flower) {
    ctx.moveTo(flower.x, flower.y);
    ctx.arc(flower.x, flower.y, flower.remain, 0, Math.PI*2);
  });
  ctx.fill();

  // bee path
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


  var last = path[path.length-1];
  var hit = withinCircle(last, target);

  // target
  ctx.beginPath();
  ctx.fillStyle = hit ? '#fc0' : '#3f8ed8';
  ctx.arc(target.x, target.y, target.r, 0, Math.PI*2);
  ctx.fill();

};

var completed = function (path, flowers, target) {

  // are we hitting the end
  var last = path[path.length-1];
  var hit = withinCircle(last, target);


  var total = flowers.reduce(function(memo, f) {
    memo.pollen += f.pollen;
    memo.remain += f.remain;
    return memo
  }, {pollen:0, remain:0});

  // have we gathered enough
  var collected = (1 - (total.remain / total.pollen)) > 0.6;

  // console.log(hit, collected, total)

  return hit && collected

};

exports.nearest = nearest;
exports.simulate = simulate;
exports.render = render;
exports.completed = completed;

}((this.jotbb = this.jotbb || {})));
