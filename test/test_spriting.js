"use strict";

// var path = require("path");
// var fs = require("fs");
var testutils = require("./testutils");

describe("spriting module", function () {

  it("sprite-map() sanity check", function (done) {
    var options = {
      data: "@import 'spriting'; .test { foo: sprite-map('test-sprite-map', sprite-layout(horizontal, (spacing: 5px, "
        + "alignment: bottom)), 'module-a/*', 'module-b/img03.png') }"
    };
    var expectedOutput = ".test {\n  foo: (sprite-map: true, name: test-sprite-map, sources: module-a/*, module-b/img03.png, layout: (strategy: horizontal, spacing: 5px, alignment: bottom), assets: (module-a/img01.png: (path: /Users/jwang5/linkedin/eyeglass-spriting/test/fixtures/test01/img01.png, position: 0px -200px, width: 100px, height: 100px), module-a/img02.png: (path: /Users/jwang5/linkedin/eyeglass-spriting/test/fixtures/test01/img02.png, position: -105px -250px, width: 50px, height: 50px), module-b/img03.png: (path: /Users/jwang5/linkedin/eyeglass-spriting/test/fixtures/test01/img03.png, position: -160px 0px, width: 200px, height: 300px))); }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

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
    var expectedOutput = ".test {\n  foo: (strategy: horizontal, spacing: 0px, alignment: bottom); }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-layout() no options", function (done) {
    var options = {
      data: ".test { foo: sprite-layout(horizontal, ()) }"
    };
    var expectedOutput = ".test {\n  foo: (strategy: horizontal, spacing: 0px, alignment: top); }"
    + "\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-list()", function (done) {
    var options = {
      data: "@import 'spriting';"
      + "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, (spacing: 5px, alignment: bottom)), 'module-a/*.png', 'module-b/img03.png');"
      + ".test{ foo: sprite-list($test-sprite-map); }"
    };
    var expectedOutput = ".test {\n  foo: module-a/img01.png, module-a/img02.png, module-b/img03.png; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-url()", function (done) {
    var options = {
      data: "@import 'spriting';"
      + "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, (spacing: 5px, alignment: bottom)), 'module-a/*.png', 'module-b/img03.png');"
      + ".test{ foo: sprite-url($test-sprite-map); }"
    };
    var expectedOutput = ".test {\n  foo: ../assets/test-sprite-map.png; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-position()", function (done) {
    var options = {
      data: "@import 'spriting';"
      + "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, (spacing: 5px, alignment: bottom)), 'module-a/*.png', 'module-b/img03.png');"
      + ".test{ foo: sprite-position($test-sprite-map, 'module-a/img02.png'); }"
    };
    var expectedOutput = ".test {\n  foo: -105px -250px; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-position-x()", function (done) {
    var options = {
      data: "@import 'spriting';"
      + "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, (spacing: 5px, alignment: bottom)), 'module-a/*.png', 'module-b/img03.png');"
      + ".test{ foo: sprite-position-x($test-sprite-map, 'module-a/img02.png'); }"
    };
    var expectedOutput = ".test {\n  foo: -105px; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-position-y()", function (done) {
    var options = {
      data: "@import 'spriting';"
      + "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, (spacing: 5px, alignment: bottom)), 'module-a/*.png', 'module-b/img03.png');"
      + ".test{ foo: sprite-position-y($test-sprite-map, 'module-a/img02.png'); }"
    };
    var expectedOutput = ".test {\n  foo: -250px; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-width()", function (done) {
    var options = {
      data: "@import 'spriting';"
      + "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, (spacing: 5px, alignment: bottom)), 'module-a/*.png', 'module-b/img03.png');"
      + ".test{ foo: sprite-width($test-sprite-map, 'module-a/img02.png'); }"
    };
    var expectedOutput = ".test {\n  foo: 50px; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-height()", function (done) {
    var options = {
      data: "@import 'spriting';"
      + "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, (spacing: 5px, alignment: bottom)), 'module-a/*.png', 'module-b/img03.png');"
      + ".test{ foo: sprite-height($test-sprite-map, 'module-a/img02.png'); }"
    };
    var expectedOutput = ".test {\n  foo: 50px; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-background mixin", function (done) {
    var options = {
      data: "@import 'spriting';"
      + "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, (spacing: 5px, alignment: bottom)), 'module-a/*.png', 'module-b/img03.png');"
      + ".test{ @include sprite-background($test-sprite-map); }"
    };
    var expectedOutput = ".test {\n  background: url(\"../assets/test-sprite-map.png\") no-repeat; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-position mixin", function (done) {
    var options = {
      data: "@import 'spriting';"
      + "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, (spacing: 5px, alignment: bottom)), 'module-a/*.png', 'module-b/img03.png');"
      + ".test{ @include sprite-position($test-sprite-map, 'module-a/img02.png'); }"
    };
    var expectedOutput = ".test {\n  background-position: -105px -250px; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  // it("large images", function (done) {
  //   var options = {
  //     data: "@import 'spriting';"
  //     + "$large-images-sm: sprite-map('test-large-images', sprite-layout(diagonal, ()), 'largeImages/*');"
  //     + ".test{ foo: sprite-url($large-images-sm) }"
  //   };
  //   var expectedOutput = ".test {\n  background-position: 105px 250px; }\n";
  //   testutils.assertCompiles(options, expectedOutput, done);
  // });

  it("small images", function (done) {
    var options = {
      data: "@import 'spriting';"
      + "$small-images-sm: sprite-map('test-small-images', sprite-layout(diagonal, ()), 'smallImages/*');"
      + ".test{ foo: sprite-url($small-images-sm) }; "
    };
    var expectedOutput = ".test {\n  foo: ../assets/test-small-images.png; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("lots of images", function (done) {
    var options = {
      data: "@import 'spriting';"
      + "$lots-of-images-sm: sprite-map('test-lots-of-images', sprite-layout(diagonal, ()), 'lotsOfImages/*');"
      + ".test{ foo: sprite-url($lots-of-images-sm) }; "
    };
    var expectedOutput = ".test {\n  foo: ../assets/test-lots-of-images.png; }\n";
    testutils.assertCompiles(options, expectedOutput, done);
  });






});
