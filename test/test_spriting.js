"use strict";

var Eyeglass = require("eyeglass").Eyeglass;
var sass = require("node-sass");
var path = require("path");

// var path = require("path");
// var fs = require("fs");
var testutils = require("./testutils");

describe("spriting module", function () {

  // it("smart packing korf 22", function (done) {
  //   this.timeout(5000);

  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$sp-sprite-map: sprite-map('spkorf22-sprite-map', sprite-layout(smartKorf, " +
  //               // "()), 'squarepacking/*');" +
  //               "(spacing: 50px, alignment: bottom)), 'squarepacking22/*');" +
  //               ".test { foo: sprite-url($sp-sprite-map); }";
  //   var expected = ".test {\n  foo: url(/spritemaps/spkorf22-sprite-map.png); }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "squarepacking22/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  it("smart packing korf", function (done) {
    this.timeout(5000);

    var input = "@import 'assets'; @import 'spriting'; " +
                "$sp-sprite-map: sprite-map('spkorf-sprite-map', sprite-layout(smartKorf, " +
                // "()), 'squarepacking/*');" +
                "(spacing: 50px, alignment: bottom)), 'squarepacking/*');" +
                ".test { foo: sprite-url($sp-sprite-map); }";
    var expected = ".test {\n  foo: url(/spritemaps/spkorf-sprite-map.png); }\n";

    var rootDir = testutils.fixtureDirectory("app_assets");

    var eg = new Eyeglass({
      root: rootDir,
      data: input
    }, sass);

    eg.assets.addSource(rootDir, {pattern: "squarepacking/**/*"});

    testutils.assertCompiles(eg, expected, done);
  });

  // it("smart packing korf small 5", function (done) {
  //   this.timeout(5000);

  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$sp-sprite-map: sprite-map('spkorf_small-sprite-map', sprite-layout(smartKorf, " +
  //               // "()), 'squarepacking/*');" +
  //               "(spacing: 50px, alignment: bottom)), 'squarepacking5_small/*');" +
  //               ".test { foo: sprite-url($sp-sprite-map); }";
  //   var expected = ".test {\n  foo: url(/spritemaps/spkorf_small-sprite-map.png); }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "squarepacking5_small/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("smart packing korf 5", function (done) {
  //   this.timeout(5000);

  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$sp-sprite-map: sprite-map('spkorf5-sprite-map', sprite-layout(smartKorf, " +
  //               // "()), 'squarepacking/*');" +
  //               "(spacing: 50px, alignment: bottom)), 'squarepacking5/*');" +
  //               ".test { foo: sprite-url($sp-sprite-map); }";
  //   var expected = ".test {\n  foo: url(/spritemaps/spkorf5-sprite-map.png); }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "squarepacking5/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("smart packing korf 50", function (done) {
  //   this.timeout(10000);

  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$sp-sprite-map: sprite-map('spkorf50-sprite-map', sprite-layout(smartKorf, " +
  //               "()), 'squarepacking50/*');" +
  //               // "(spacing: 50px, alignment: bottom)), 'squarepacking/*');" +
  //               ".test { foo: sprite-url($sp-sprite-map); }";
  //   var expected = ".test {\n  foo: url(/spritemaps/spkorf50-sprite-map.png); }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "squarepacking50/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("smart packing korf 200", function (done) {
  //   this.timeout(5000);

  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$sp-sprite-map: sprite-map('spkorf200-sprite-map', sprite-layout(smartKorf, " +
  //               "()), 'squarepacking200/*');" +
  //               // "(spacing: 50px, alignment: bottom)), 'squarepacking/*');" +
  //               ".test { foo: sprite-url($sp-sprite-map); }";
  //   var expected = ".test {\n  foo: url(/spritemaps/spkorf200-sprite-map.png); }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "squarepacking200/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("smart packing kd", function (done) {
  //   this.timeout(2000);

  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$sp-sprite-map: sprite-map('spkd-sprite-map', sprite-layout(smartKd, " +
  //               "()), 'squarepacking/*');" +
  //               // "(spacing: 50px, alignment: bottom)), 'squarepacking/*');" +
  //               ".test { foo: sprite-url($sp-sprite-map); }";
  //   var expected = ".test {\n  foo: url(/spritemaps/spkd-sprite-map.png); }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "squarepacking/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("smart packing kd 50", function (done) {
  //   this.timeout(3000);

  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$sp-sprite-map: sprite-map('spkd50-sprite-map', sprite-layout(smartKd, " +
  //               "()), 'squarepacking50/*');" +
  //               // "(spacing: 50px, alignment: bottom)), 'squarepacking/*');" +
  //               ".test { foo: sprite-url($sp-sprite-map); }";
  //   var expected = ".test {\n  foo: url(/spritemaps/spkd50-sprite-map.png); }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "squarepacking50/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("smart packing kd 200", function (done) {
  //   this.timeout(5000);

  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$sp-sprite-map: sprite-map('spkd200-sprite-map', sprite-layout(smartKd, " +
  //               "()), 'squarepacking200/*');" +
  //               // "(spacing: 50px, alignment: bottom)), 'squarepacking/*');" +
  //               ".test { foo: sprite-url($sp-sprite-map); }";
  //   var expected = ".test {\n  foo: url(/spritemaps/spkd200-sprite-map.png); }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "squarepacking200/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("gets sprite map data using app assets", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               ".sprite-map-test { foo: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'images/*'); }";
  //   var expected = ".sprite-map-test {\n  foo: (sprite-map: true, name: test-sprite-map, sources:" +
  //     " images/*, layout: (strategy: horizontal, spacing: 5px, alignment: bottom), assets: " +
  //     "(images/img01.png: (path: "
  //     + testutils.fixtureDirectory(path.join("app_assets", "images", "img01.png")) + ", " +
  //     "identifier: img01, position: 0px -200px, width: 100px, height: 100px), images/img02.png: " +
  //     "(path: " + testutils.fixtureDirectory(path.join("app_assets", "images", "img02.png")) + "," +
  //     " identifier: img02, position: -105px -250px, width: 50px, height: 50px), images/img03.png:" +
  //     " (path: " + testutils.fixtureDirectory(path.join("app_assets", "images", "img03.png")) +
  //     ", identifier: img03, position: -160px 0px, width: 200px, height: 300px)), width: 360px, " +
  //     "height: 300px); }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "images/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("gets sprite map data using module assets", function (done) {
  //   var input = "@import 'assets'; @import 'mod-one/assets'; @import 'spriting'; " +
  //               ".sprite-map-test { foo: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'mod-one/*'); }";
  //   var expected = ".sprite-map-test {\n  foo: (sprite-map: true, name: test-sprite-map, sources:" +
  //     " mod-one/*, layout: (strategy: horizontal, spacing: 5px, alignment: bottom), assets: " +
  //     "(mod-one/img01.png: (path: "
  //     + testutils.fixtureDirectory(path.join("app_assets", "node_modules", "asset_mod_1", "images",
  //     "img01.png")) + ", identifier: img01, position: 0px -200px, width: 100px, height: 100px), " +
  //     "mod-one/img02.png: (path: " + testutils.fixtureDirectory(path.join("app_assets",
  //     "node_modules", "asset_mod_1", "images", "img02.png")) + ", identifier: img02, position: " +
  //     "-105px -250px, width: 50px, height: 50px), mod-one/img03.png: (path: "
  //     + testutils.fixtureDirectory(path.join("app_assets", "node_modules", "asset_mod_1", "images",
  //     "img03.png")) + ", identifier: img03, position: -160px 0px, width: 200px, height: " +
  //     "300px)), width: 360px, height: 300px); }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "images/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("creates the sprite map image and gets url", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$test-sprite-map: sprite-map('test-sprite-map1', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'images/*');" +
  //               ".test { foo: sprite-url($test-sprite-map); }";
  //   var expected = ".test {\n  foo: url(/spritemaps/test-sprite-map1.png); }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "images/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // // it("gets sprite map data using app & module assets with conflicting names", function (done) {
  // //   // TODO: test this
  // //   done();
  // // });

  // it("sprite-layout() sanity check", function (done) {
  //   var options = {
  //     data: ".test { foo: sprite-layout(horizontal, (spacing: 50px, alignment: bottom)) }"
  //   };
  //   var expectedOutput = ".test {\n  foo: (strategy: horizontal, spacing: 50px, alignment: " +
  //     "bottom); }\n";

  //   var eg = new Eyeglass(options, sass);
  //   testutils.assertCompiles(eg, expectedOutput, done);
  // });

  // it("sprite-layout() check missing parameters", function (done) {
  //   var options = {
  //     data: ".test { foo: sprite-layout(horizontal, (alignment: bottom)) }"
  //   };
  //   var expectedOutput = ".test {\n  foo: (strategy: horizontal, spacing: 0px, " +
  //                        "alignment: bottom); }\n";

  //   var eg = new Eyeglass(options, sass);
  //   testutils.assertCompiles(eg, expectedOutput, done);
  // });

  // it("sprite-layout() no options", function (done) {
  //   var options = {
  //     data: ".test { foo: sprite-layout(horizontal, ()) }"
  //   };
  //   var expectedOutput = ".test {\n  foo: (strategy: horizontal, spacing: 0px); }"
  //   + "\n";

  //   var eg = new Eyeglass(options, sass);
  //   testutils.assertCompiles(eg, expectedOutput, done);
  // });

  // it("sprite-list()", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'images/*');" +
  //               ".test{ foo: sprite-list($test-sprite-map) }";
  //   var expected = ".test {\n  foo: images/img01.png, images/img02.png, images/img03.png; }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "images/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("sprite-url()", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$test-sprite-map: sprite-map('test-sprite-map2', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'images/*');" +
  //               ".test{ foo: sprite-url($test-sprite-map) }";
  //   var expected = ".test {\n  foo: url(/spritemaps/test-sprite-map2.png); }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "images/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("sprite-position()", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'images/*');" +
  //               ".test{ foo: sprite-position($test-sprite-map, 'images/img02.png') }";
  //   var expected = ".test {\n  foo: -105px -250px; }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "images/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("sprite-position-x()", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'images/*');" +
  //               ".test{ foo: sprite-position-x($test-sprite-map, 'images/img02.png') }";
  //   var expected = ".test {\n  foo: -105px; }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "images/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("sprite-position-y()", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'images/*');" +
  //               ".test{ foo: sprite-position-y($test-sprite-map, 'images/img02.png') }";
  //   var expected = ".test {\n  foo: -250px; }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "images/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("sprite-width()", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'images/*');" +
  //               ".test{ foo: sprite-width($test-sprite-map, 'images/img02.png') }";
  //   var expected = ".test {\n  foo: 50px; }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "images/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("sprite-height()", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'images/*');" +
  //               ".test{ foo: sprite-height($test-sprite-map, 'images/img02.png') }";
  //   var expected = ".test {\n  foo: 50px; }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "images/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("sprite-map-width()", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'images/*');" +
  //               ".test{ foo: sprite-map-width($test-sprite-map) }";
  //   var expected = ".test {\n  foo: 360px; }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "images/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("sprite-map-height()", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'images/*');" +
  //               ".test{ foo: sprite-map-height($test-sprite-map) }";
  //   var expected = ".test {\n  foo: 300px; }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "images/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("sprite-background mixin", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$test-sprite-map: sprite-map('test-sprite-map3', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'images/*');" +
  //               ".test{ @include sprite-background($test-sprite-map) }";
  //   var expected = ".test {\n  background: url(/spritemaps/test-sprite-map3.png) no-repeat; }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "images/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("sprite-position mixin", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'images/*');" +
  //               ".test{ @include sprite-position($test-sprite-map, 'images/img02.png') }";
  //   var expected = ".test {\n  background-position: -105px -250px; }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "images/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("sprite-layout() throws error for invalid layout", function (done) {
  //   var options = {
  //     data: ".test { foo: sprite-layout(horizontal, (alignment: right, spacing: 5px)) }"
  //   };
  //   var expectedError = "error in C function sprite-layout: Error: Invalid layout alignment: " +
  //                       "'right'.\n\nBacktrace:\n\tstdin:1, in function `sprite-layout`\n\tstdin:1";

  //   var eg = new Eyeglass(options, sass);
  //   testutils.assertCompilationError(eg, expectedError, done);
  // });

  // it("sprite-layout() throws error for invalid strategy", function (done) {
  //   var options = {
  //     data: ".test { foo: sprite-layout(horizntal, (alignment: right, spacing: 5px)) }"
  //   };
  //   var expectedError = "error in C function sprite-layout: Error: Invalid layout strategy: " +
  //                       "'horizntal'.\n\nBacktrace:\n\tstdin:1, in function `sprite-layout`" +
  //                       "\n\tstdin:1";

  //   var eg = new Eyeglass(options, sass);
  //   testutils.assertCompilationError(eg, expectedError, done);
  // });

  // it("sprite-identifier()", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'images/*');" +
  //               ".test{ foo: sprite-identifier($test-sprite-map, 'images/img02.png') }";
  //   var expected = ".test {\n  foo: img02; }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "images/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("small images", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$test-sprite-map: sprite-map('test-smallimages-sprite-map', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'smallimages/*');" +
  //               ".test { foo: sprite-url($test-sprite-map); }";
  //   var expected = ".test {\n  foo: url(/spritemaps/test-smallimages-sprite-map.png); }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "smallimages/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });

  // it("lots of images", function (done) {
  //   var input = "@import 'assets'; @import 'spriting'; " +
  //               "$test-sprite-map: sprite-map('test-lots-sprite-map', sprite-layout(horizontal, " +
  //               "(spacing: 5px, alignment: bottom)), 'lotsofimages/*');" +
  //               ".test { foo: sprite-url($test-sprite-map); }";
  //   var expected = ".test {\n  foo: url(/spritemaps/test-lots-sprite-map.png); }\n";

  //   var rootDir = testutils.fixtureDirectory("app_assets");

  //   var eg = new Eyeglass({
  //     root: rootDir,
  //     data: input
  //   }, sass);

  //   eg.assets.addSource(rootDir, {pattern: "lotsofimages/**/*"});

  //   testutils.assertCompiles(eg, expected, done);
  // });
});
