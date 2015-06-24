// var SpriteMap = require("./SpriteMap");

// var imagePaths = ["images/corgi", "images/samoyed", "images/corgi/oliver.jpg"];

// var sm = new SpriteMap(imagePaths);


var c = require("cassowary");

var solver = new c.SimplexSolver();

function Point(x, y) {
  this.x = x;
  this.y = y;
}

// 190 * 190 square
var points = [
  new Point(10, 10),
  new Point(10, 200),
  new Point(200, 200),
  new Point(200, 10),

  new Point(0, 0),
  new Point(0, 0),
  new Point(0, 0),
  new Point(0, 0)
];

var midpoints = [
  new Point(0, 0),
  new Point(0, 0),
  new Point(0, 0),
  new Point(0, 0)
];

var x = new c.Variable({ value: 167 });
var y = new c.Variable({ value: 2 });
var eq = new c.Equation(x, new c.Expression(y));
solver.addConstraint(eq);

console.log(solver);
