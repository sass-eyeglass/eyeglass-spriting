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
      data: ".test { foo: sprite-map('corgi-spritemap', sprite-layout(horizontal, (spacing: 100px, "
        + "alignment: bottom)), 'images/corgi', 'images/samoyed', 'images/corgi/oliver.jpg') }"
    };
    var expectedOutput = ".test {\n  foo: corgi-spritemap; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-layout() sanity check", function (done) {
    var options = {
      data: ".test { foo: sprite-layout(horizontal, (spacing: 50px, alignment: bottom)) }"
    };
    var expectedOutput = ".test {\n  foo: (layout: horizontal, spacing: 50px, alignment: bottom); }"
    + "\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-layout() check missing parameters", function (done) {
    var options = {
      data: ".test { foo: sprite-layout(horizontal, (alignment: bottom)) }"
    };
    var expectedOutput = ".test {\n  foo: (layout: horizontal, alignment: bottom); }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-list()", function (done) {
    var options = {
      data: ".test { foo: sprite-list('corgi-spritemap') }"
    };
    var expectedOutput = ".test {\n  foo: images/corgi/blurrycorgi.png images/corgi/corgiball.gif images/corgi/corgistampede.jpg images/corgi/oliver.jpg images/corgi/twocorgies.png images/samoyed/129500461375869254.jpg images/samoyed/il_fullxfull.331833603.jpg images/samoyed/Samoyed-3.jpg ; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-url()", function (done) {
    var options = {
      data: ".test { foo: sprite-url('corgi-spritemap') }"
    };
    var expectedOutput = ".test {\n  foo: corgi-spritemap.png; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-position()", function (done) {
    var options = {
      data: ".test { foo: sprite-position('corgi-spritemap', 'images/corgi/corgiball.gif') }"
    };
    var expectedOutput = ".test {\n  foo: 300px 925px; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-position-x()", function (done) {
    var options = {
      data: ".test { foo: sprite-position-x('corgi-spritemap', 'images/corgi/corgiball.gif') }"
    };
    var expectedOutput = ".test {\n  foo: 300px; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-position-y()", function (done) {
    var options = {
      data: ".test { foo: sprite-position-y('corgi-spritemap', 'images/corgi/corgiball.gif') }"
    };
    var expectedOutput = ".test {\n  foo: 925px; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-width()", function (done) {
    var options = {
      data: ".test { foo: sprite-width('corgi-spritemap', 'images/corgi/corgiball.gif') }"
    };
    var expectedOutput = ".test {\n  foo: 296px; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-height()", function (done) {
    var options = {
      data: ".test { foo: sprite-height('corgi-spritemap', 'images/corgi/corgiball.gif') }"
    };
    var expectedOutput = ".test {\n  foo: 200px; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-background mixin", function (done) {
    var options = {
      data: "@import 'spriting'; .test { @include sprite-background('corgi-spritemap'); }"
    };
    var expectedOutput = ".test {\n  background: url(\"corgi-spritemap.png\") no-repeat; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-position mixin", function (done) {
    var options = {
      data: "@import 'spriting'; .test { @include sprite-position('corgi-spritemap', 'images/corgi/corgiball.gif'); }"
    };
    var expectedOutput = ".test {\n  background-position: 300px 925px; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });


});
