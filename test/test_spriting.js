"use strict";

// var path = require("path");
// var fs = require("fs");
var testutils = require("./testutils");

describe("spriting module", function () {
	// it("has heartbeat", function (done) {
	// 	var options = {
 //      data: "@import 'spriting'; .heartbeat { foo : hello-assets(); bar: $eyeglass-spriting }"
 //    };
 //    var expectedOutput = ".heartbeat {\n  foo: hello assets;\n  bar: true; }\n";
 //    testutils.assertCompiles(options, expectedOutput, done);
 //  });

  it("sprite-map() sanity check", function (done) {
    var options = {
      data: ".test { foo: sprite-map('corgi', sprite-layout(horizontal, (spacing: 50px, alignment: bottom)), 'images/corgi', 'images/samoyed', 'images/corgi/oliver.jpg') }"
    };
    var expectedOutput = ".test {\n  foo: corgi.png; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-layout() sanity check", function (done) {
    var options = {
      data: ".test { foo: sprite-layout(horizontal, (spacing: 50px, alignment: bottom)) }"
    };
    var expectedOutput = ".test {\n  foo: (layout: horizontal, spacing: 50px, alignment: bottom); }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  // it("sprite-map() works with sprite-layout()", function (done) {
  //   var options = {
  //     data: ".test { foo: sprite-map('corgi', '-vr', 'images/corgi', 'images/samoyed', 'images/corgi/oliver.jpg') }"
  //   };
  //   var expectedOutput = ".test {\n  foo: corgi.png; }\n";
  //   testutils.assertCompiles(options, expectedOutput, done);
  // });

  // it("sprite-map() layout", function (done) {
  //   var options = {
  //     data: ".test { foo: sprite-map('corgi', '-vr', 'images/corgi', 'images/samoyed', 'images/corgi/oliver.jpg') }"
  //   };
  //   var expectedOutput = ".test {\n  foo: corgi.png; }\n";
  //   testutils.assertCompiles(options, expectedOutput, done);
  // });


});
