"use strict";

var path = require("path");
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
      data: "@import 'spriting'; .test { foo: sprite-map('test-spritemap', sprite-layout(horizontal, (spacing: 5px, "
        + "alignment: bottom)), 'module-a/*.png', 'module-b/img03.png') }"
    };
    var expectedOutput = ".test {\n  foo: (sprite-map: true, name: test-spritemap, sources: module-a/*.png, module-b/img03.png, layout: (strategy: horizontal, spacing: 5px, alignment: bottom), assets: (module-a/img01.png: (path: /Users/jwang5/linkedin/spritebuilder/test/fixtures/test01/img01.png, position: 0px 200px, width: 100, height: 100), module-a/img02.png: (path: /Users/jwang5/linkedin/spritebuilder/test/fixtures/test01/img02.png, position: 105px 250px, width: 50, height: 50), module-b/img03.png: (path: /Users/jwang5/linkedin/spritebuilder/test/fixtures/test01/img03.png, position: 160px 0px, width: 200, height: 300))); }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  // it("sprite-map() sanity check", function (done) {
  //   var options = {
  //     data: ".test { foo: sprite-map('corgi-spritemap', sprite-layout(horizontal, (spacing: 100px, "
  //       + "alignment: bottom)), 'images/corgi', 'images/samoyed', 'images/corgi/oliver.jpg') }"
  //   };
  //   var expectedOutput = ".test {\n  foo: corgi-spritemap; }\n";
  //   testutils.assertCompiles(options, expectedOutput, done);
  // });

  it("sprite-layout() sanity check", function (done) {
    var options = {
      data: ".test { foo: sprite-layout(horizontal, (spacing: 50px, alignment: bottom)) }"
    };
    var expectedOutput = ".test {\n  foo: (strategy: horizontal, spacing: 50px, alignment: bottom); }"
    + "\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-layout() check missing parameters", function (done) {
    var options = {
      data: ".test { foo: sprite-layout(horizontal, (alignment: bottom)) }"
    };
    var expectedOutput = ".test {\n  foo: (strategy: horizontal, alignment: bottom); }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-list()", function (done) {
    var options = {
      data: "@import 'spriting';"
      + "$test-sprite-map: sprite-map('test-spritemap', sprite-layout(horizontal, (spacing: 5px, alignment: bottom)), 'module-a/*.png', 'module-b/img03.png');"
      + ".test{ foo: sprite-list($test-sprite-map); }"
    };
    var expectedOutput = ".test {\n  foo: module-a/img01.png module-a/img02.png module-b/img03.png ; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  // it("sprite-url()", function (done) {
  //   var options = {
  //     data: "@import 'spriting';"
  //     + "$test-sprite-map: sprite-map('test-spritemap', sprite-layout(horizontal, (spacing: 5px, alignment: bottom)), 'module-a/*.png', 'module-b/img03.png');"
  //     + ".test{ foo: sprite-url($test-sprite-map); }"
  //   };
  //   var expectedOutput = ".test {\n  foo: module-a/img01.png module-a/img02.png module-b/img03.png ; }\n";
  //   testutils.assertCompiles(options, expectedOutput, done);
  // });


  // it("sprite-list()", function (done) {
  //   var options = {
  //     data: ".test { foo: sprite-list('corgi-spritemap') }"
  //   };
  //   var expectedOutput = ".test {\n  foo: images/corgi/blurrycorgi.png images/corgi/corgiball.gif images/corgi/corgistampede.jpg images/corgi/oliver.jpg images/corgi/twocorgies.png images/samoyed/129500461375869254.jpg images/samoyed/il_fullxfull.331833603.jpg images/samoyed/Samoyed-3.jpg ; }\n";
  //   testutils.assertCompiles(options, expectedOutput, done);
  // });

  // it("sprite-url()", function (done) {
  //   var options = {
  //     data: ".test { foo: sprite-url('corgi-spritemap') }"
  //   };
  //   var expectedOutput = ".test {\n  foo: corgi-spritemap.png; }\n";
  //   testutils.assertCompiles(options, expectedOutput, done);
  // });

  // it("sprite-position()", function (done) {
  //   var options = {
  //     data: ".test { foo: sprite-position('corgi-spritemap', 'images/corgi/corgiball.gif') }"
  //   };
  //   var expectedOutput = ".test {\n  foo: 300px 925px; }\n";
  //   testutils.assertCompiles(options, expectedOutput, done);
  // });

  // it("sprite-position-x()", function (done) {
  //   var options = {
  //     data: ".test { foo: sprite-position-x('corgi-spritemap', 'images/corgi/corgiball.gif') }"
  //   };
  //   var expectedOutput = ".test {\n  foo: 300px; }\n";
  //   testutils.assertCompiles(options, expectedOutput, done);
  // });

  // it("sprite-position-y()", function (done) {
  //   var options = {
  //     data: ".test { foo: sprite-position-y('corgi-spritemap', 'images/corgi/corgiball.gif') }"
  //   };
  //   var expectedOutput = ".test {\n  foo: 925px; }\n";
  //   testutils.assertCompiles(options, expectedOutput, done);
  // });

  // it("sprite-width()", function (done) {
  //   var options = {
  //     data: ".test { foo: sprite-width('corgi-spritemap', 'images/corgi/corgiball.gif') }"
  //   };
  //   var expectedOutput = ".test {\n  foo: 296px; }\n";
  //   testutils.assertCompiles(options, expectedOutput, done);
  // });

  // it("sprite-height()", function (done) {
  //   var options = {
  //     data: ".test { foo: sprite-height('corgi-spritemap', 'images/corgi/corgiball.gif') }"
  //   };
  //   var expectedOutput = ".test {\n  foo: 200px; }\n";
  //   testutils.assertCompiles(options, expectedOutput, done);
  // });

  // it("sprite-background mixin", function (done) {
  //   var options = {
  //     data: "@import 'spriting'; .test { @include sprite-background('corgi-spritemap'); }"
  //   };
  //   var expectedOutput = ".test {\n  background: url(\"corgi-spritemap.png\") no-repeat; }\n";
  //   testutils.assertCompiles(options, expectedOutput, done);
  // });

  // it("sprite-position mixin", function (done) {
  //   var options = {
  //     data: "@import 'spriting'; .test { @include sprite-position('corgi-spritemap', 'images/corgi/corgiball.gif'); }"
  //   };
  //   var expectedOutput = ".test {\n  background-position: 300px 925px; }\n";
  //   testutils.assertCompiles(options, expectedOutput, done);
  // });


});
