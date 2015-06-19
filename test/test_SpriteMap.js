// "use strict";

// var path = require("path");
// var lwip = require("lwip");
// var l = require("../Layout");
// var SpriteMap = require("../SpriteMap");
// var assert = require("assert");

// describe("SpriteMap", function () {

//     // it("can require lwip", function (done) {
//     //   var lwip = require("lwip");
//     //   done();
//     // });

//     it("can open image", function (done) {
//       lwip.open(path.join(__dirname, "images/image.png"), function(err, image) {
//         if (err) throw err;
//         else done();
//       });
//     });

//     it("can manipulate and save new image", function (done) {
//       lwip.open(path.join(__dirname, "images/image.png"), function(err, image) {
//         if (err) throw err;
//         image.batch()
//           .scale(0.75)          // scale to 75%
//           .rotate(45, "white")  // rotate 45degs clockwise (white fill)
//           .crop(200, 200)       // crop a 200X200 square from center
//           .blur(5)              // Gaussian blur with SD=5
//           .writeFile("test/results/output.png", function(error){
//             if (error) throw error;
//             done();
//           });
//       });
//     });

//     it("can get packing style", function(done) {
//       l.getPackingStyle("vertical", { alignment: "left", spacing: 0 });
//       done();
//     });

//     it("can require SpriteMap", function (done) {
//       require("../SpriteMap");
//       done();
//     });

//     // it("can create SpriteMap instance", function (done) {
//     //   // var SpriteMap = require("../SpriteMap");
//     //   var sm = new SpriteMap("images");
//     //   done();
//     // });

//     it("can get sprites data", function(done) {
//       var sm = new SpriteMap("getdatatest", ["test/images/test02"]);
//       sm.getData(function() {
//         sm.pack(l.getPackingStyle("vertical", { alignment: "left", spacing: 0 });, 0);
//         done();
//       });
//     });

//     it("can save sprites data", function(done) {
//         var sm = new SpriteMap("savedatatest", ["test/images/test02"]);
//         sm.getData(function() {
//             sm.pack(ps.getPackingStyle("-vl"), 0);
//             sm.saveData("test/results/data.json", function(err, success) {
//               if (err) throw err;
//             });
//             done();
//         });
//     });

//     it("can create & save spritemap png", function(done) {
//         var sm = new SpriteMap("createandsavetest", ["test/images/test02"]);
//         sm.getData(function() {
//             sm.pack(ps.getPackingStyle("-vl"), 0);
//             sm.createSpriteMap("test/results/spritemap.png", function(err, success) {
//               if (err) throw err;
//             });
//             done();
//         });
//     });

//     it("should create spritemap of one image with correct dimensions", function(done) {
//       var width = 100;
//       var height = 100;
//       lwip.create(width, height, "yellow", function(err, image) {
//         if (err) throw err;
//         image.writeFile(path.join(__dirname, "images/test01/test.png"), function(error) {
//           if (error) throw error;
//           var sm = new SpriteMap("test", ["test/images/test01"]);
//           sm.getData(function() {
//             sm.pack(ps.getPackingStyle("-vl"), 0);
//             assert.equal(sm.width, width);
//             assert.equal(sm.height, height);
//             done();
//           });
//         });
//       });

//     });

//   it("should generate correct sprite data & dimensions (vertical left)", function(done) {
//     var expectedData = [
//       {name: "test/images/test02/test1.png",
//       filename: "test/images/test02/test1.png",
//       width: 50,
//       height: 50,
//       md5sum: "59243a4251d32aca9b6a9244a2f49640",
//       origin_x: 0,
//       origin_y: 0},
//       {name: "test/images/test02/test2.png",
//       filename: "test/images/test02/test2.png",
//       width: 200,
//       height: 300,
//       md5sum: "7e1b143cf5c4a36757f7ca8331d6d81d",
//       origin_x: 0,
//       origin_y: 50}
//     ];
//     var sm = new SpriteMap("test", ["test/images/test02"]);
//     sm.getData(function() {
//       sm.pack(ps.getPackingStyle("-vl"), 0);
//       assert.equal(sm.width, 200);
//       assert.equal(sm.height, 350);
//       assert.deepEqual(sm.sprites, expectedData);
//       done();
//     });
//   });

//   it("should generate correct sprite data & dimensions (vertical right)", function(done) {
//     var expectedData = [
//       {name: "test/images/test02/test1.png",
//       filename: "test/images/test02/test1.png",
//       width: 50,
//       height: 50,
//       md5sum: "59243a4251d32aca9b6a9244a2f49640",
//       origin_x: 150,
//       origin_y: 0},
//       {name: "test/images/test02/test2.png",
//       filename: "test/images/test02/test2.png",
//       width: 200,
//       height: 300,
//       md5sum: "7e1b143cf5c4a36757f7ca8331d6d81d",
//       origin_x: 0,
//       origin_y: 50}
//     ];
//     var sm = new SpriteMap("test", ["test/images/test02"]);
//     sm.getData(function() {
//       sm.pack(ps.getPackingStyle("-vr"), 0);
//       assert.equal(sm.width, 200);
//       assert.equal(sm.height, 350);
//       assert.deepEqual(sm.sprites, expectedData);
//       done();
//     });
//   });

//   it("should generate correct sprite data & dimensions (horizontal top)", function(done) {
//     var expectedData = [
//       {name: "test/images/test02/test1.png",
//       filename: "test/images/test02/test1.png",
//       width: 50,
//       height: 50,
//       md5sum: "59243a4251d32aca9b6a9244a2f49640",
//       origin_x: 0,
//       origin_y: 0},
//       {name: "test/images/test02/test2.png",
//       filename: "test/images/test02/test2.png",
//       width: 200,
//       height: 300,
//       md5sum: "7e1b143cf5c4a36757f7ca8331d6d81d",
//       origin_x: 50,
//       origin_y: 0}
//     ];
//     var sm = new SpriteMap("test", ["test/images/test02"]);
//     sm.getData(function() {
//       sm.pack(ps.getPackingStyle("-ht"), 0);
//       assert.equal(sm.width, 250);
//       assert.equal(sm.height, 300);
//       assert.deepEqual(sm.sprites, expectedData);
//       done();
//     });
//   });

//   it("should generate correct sprite data & dimensions (horizontal bottom)", function(done) {
//     var expectedData = [
//       {name: "test/images/test02/test1.png",
//       filename: "test/images/test02/test1.png",
//       width: 50,
//       height: 50,
//       md5sum: "59243a4251d32aca9b6a9244a2f49640",
//       origin_x: 0,
//       origin_y: 250},
//       {name: "test/images/test02/test2.png",
//       filename: "test/images/test02/test2.png",
//       width: 200,
//       height: 300,
//       md5sum: "7e1b143cf5c4a36757f7ca8331d6d81d",
//       origin_x: 50,
//       origin_y: 0}
//     ];
//     var sm = new SpriteMap("test", ["test/images/test02"]);
//     sm.getData(function() {
//       sm.pack(ps.getPackingStyle("-hb"), 0);
//       assert.equal(sm.width, 250);
//       assert.equal(sm.height, 300);
//       assert.deepEqual(sm.sprites, expectedData);
//       done();
//     });
//   });

//   it("should generate correct sprite data & dimensions (diagonal)", function(done) {
//     var expectedData = [
//       {name: "test/images/test02/test1.png",
//       filename: "test/images/test02/test1.png",
//       width: 50,
//       height: 50,
//       md5sum: "59243a4251d32aca9b6a9244a2f49640",
//       origin_x: 0,
//       origin_y: 0},
//       {name: "test/images/test02/test2.png",
//       filename: "test/images/test02/test2.png",
//       width: 200,
//       height: 300,
//       md5sum: "7e1b143cf5c4a36757f7ca8331d6d81d",
//       origin_x: 50,
//       origin_y: 50}
//     ];
//     var sm = new SpriteMap("test", ["test/images/test02"]);
//     sm.getData(function() {
//       sm.pack(ps.getPackingStyle("-d"), 0);
//       assert.equal(sm.width, 250);
//       assert.equal(sm.height, 350);
//       assert.deepEqual(sm.sprites, expectedData);
//       done();
//     });
//   });

// });
