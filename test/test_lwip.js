// "use strict";

// var Eyeglass = require("eyeglass").Eyeglass;
// var sass = require("node-sass");
// var path = require("path");
// var lwip = require("lwip");
// var fs = require("fs");

// // var path = require("path");
// // var fs = require("fs");
// var testutils = require("./testutils");

// describe("lwip metadata feature", function () {

//   it("writes metadata", function (done) {
//     var filename = testutils.fixtureDirectory("testlwip.png");
//     var width = 100;
//     var height = 100;

//     lwip.create(width, height, function(err, image) {
//       if (err) {
//         throw err;
//       }

//       // var spritesData = JSON.parse(fs.readFileSync(testutils.fixtureDirectory("testlwip.json")), "utf8");

//       // var metadata = "Lorem ipsum dolor sit amet";
//       // var metadata = {};
//       // var metadata = "Q";
//       // var metadata = null;
//       var metadata = "";
//       // var metadata = JSON.stringify(spritesData, null, 2);

//       image.setMetadata(metadata);

//       image.writeFile(filename, function(writeErr) {
//         if (writeErr) {
//           throw writeErr;
//         }
//         console.log("wrote image to file \'" + filename + "\'");
//         done();
//       });
//     });
//   });

//   it("opens image with metadata and writes more metadata", function (done) {
//     var filename = testutils.fixtureDirectory("testlwip.png");
//     var width = 100;
//     var height = 100;

//     lwip.open(filename, function(err, image) {
//       if (err) {
//         throw err;
//       }

//       // var spritesData = JSON.parse(fs.readFileSync(testutils.fixtureDirectory("testlwip.json")), "utf8");
//       // image.setMetadata(JSON.stringify(spritesData, null, 2));
//       // console.log("*** getMetadata(): ***\n" + image.getMetadata());

//       image.setMetadata("Lorem ipsum dolor sit amet");
//       // image.setMetadata({});
//       // image.setMetadata(null);

//       image.writeFile(testutils.fixtureDirectory("testlwip2.png"), function(writeErr) {
//         if (writeErr) {
//           throw writeErr;
//         }
//         console.log("wrote image to file \'testlwip2.png\'");
//         done();
//       });
//     });
//   });

//   it("reads metadata", function (done) {
//     var filename = testutils.fixtureDirectory("testlwip.png");
//     // var filename = testutils.fixtureDirectory("nometadata.png");

//     lwip.open(filename, function(err, image) {
//         if (err) {
//           throw err;
//         }

//         var metadata = image.getMetadata();

//         console.log(metadata);

//         if (!metadata && metadata !== "") {
//           console.log("metadata not found :(");
//         } else {
//           console.log("metadata found yay: \'" + metadata + "\'\n");
//         }

//         done();

//       });
//   });



// });
