"use strict";

var Eyeglass = require("eyeglass");
var sass = require("node-sass");
var path = require("path");
var Testutils = require("eyeglass-dev-testutils");
var testutils = new Testutils({
  engines: {
    sass: sass,
    eyeglass: Eyeglass
  }
});

function fixtureDirectory(subpath) {
  return path.resolve(__dirname, "fixtures", subpath);
}

describe("spriting module", function () {

  it("gets sprite map data using app assets", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "/* #{inspect(sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'images/*'))} */";
    var expected = "/* (sprite-map: true, name: test-sprite-map, sources:" +
      " images/*, layout: (strategy: horizontal, spacing: 5px, alignment: bottom), assets: " +
      "(images/img01.png: (path: "
      + fixtureDirectory(path.join("app_assets", "images", "img01.png")) + ", " +
      "identifier: img01, position: 0px -200px, width: 100px, height: 100px), images/img02.png: " +
      "(path: " + fixtureDirectory(path.join("app_assets", "images", "img02.png")) + "," +
      " identifier: img02, position: -105px -250px, width: 50px, height: 50px), images/img03.png:" +
      " (path: " + fixtureDirectory(path.join("app_assets", "images", "img03.png")) +
      ", identifier: img03, position: -160px 0px, width: 200px, height: 300px)), width: 360px, " +
      "height: 300px) */";

    var rootDir = fixtureDirectory("app_assets");

    var eyeglass = new Eyeglass({
      data: input,
      eyeglass: {
        root: rootDir,
        engines: {
          sass: sass
        }
      }
    });

    eyeglass.assets.addSource(rootDir, {pattern: "images/**/*"});

    testutils.assertCompiles(eyeglass, expected, done);
  });

  it("gets sprite map data using module assets", function (done) {
    var input = "@import 'assets'; @import 'mod-one/assets'; @import 'spriting'; " +
                "/* #{inspect(sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'mod-one/*'))} */";
    var expected = "/* (sprite-map: true, name: test-sprite-map, sources:" +
      " mod-one/*, layout: (strategy: horizontal, spacing: 5px, alignment: bottom), assets: " +
      "(mod-one/img01.png: (path: "
      + fixtureDirectory(path.join("app_assets", "node_modules", "asset_mod_1", "images",
      "img01.png")) + ", identifier: img01, position: 0px -200px, width: 100px, height: 100px), " +
      "mod-one/img02.png: (path: " + fixtureDirectory(path.join("app_assets",
      "node_modules", "asset_mod_1", "images", "img02.png")) + ", identifier: img02, position: " +
      "-105px -250px, width: 50px, height: 50px), mod-one/img03.png: (path: "
      + fixtureDirectory(path.join("app_assets", "node_modules", "asset_mod_1", "images",
      "img03.png")) + ", identifier: img03, position: -160px 0px, width: 200px, height: " +
      "300px)), width: 360px, height: 300px) */";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "images/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });

  it("creates the sprite map image and gets url", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'images/*');" +
                ".test {foo: sprite-url($test-sprite-map); }";
    var expected = ".test {\n  foo: url(/spritemaps/test-sprite-map.png); }\n";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "images/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });

  // it("gets sprite map data using app & module assets with conflicting names", function (done) {
  //   // TODO: test this
  //   done();
  // });

  it("sprite-layout() sanity check", function (done) {
    var options = {
      data: "/* #{inspect(sprite-layout(horizontal, (spacing: 50px, alignment: bottom)))} */"
    };
    var expectedOutput = "/* (strategy: horizontal, spacing: 50px, alignment: " +
      "bottom) */";

    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-layout() check missing parameters", function (done) {
    var options = {
      data: "/* #{inspect(sprite-layout(horizontal, (alignment: bottom)))} */"
    };
    var expectedOutput = "/* (strategy: horizontal, spacing: 0px, " +
                         "alignment: bottom) */";

    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-layout() no options", function (done) {
    var options = {
      data: "/* #{inspect(sprite-layout(horizontal, ()))} */"
    };
    var expectedOutput = "/* (strategy: horizontal, spacing: 0px) */";

    testutils.assertCompiles(options, expectedOutput, done);
  });

  it("sprite-list()", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'images/*');" +
                ".test{foo: sprite-list($test-sprite-map) }";
    var expected = ".test {\n  foo: images/img01.png, images/img02.png, images/img03.png; }\n";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "images/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });

  it("sprite-url()", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'images/*');" +
                ".test{foo: sprite-url($test-sprite-map) }";
    var expected = ".test {\n  foo: url(/spritemaps/test-sprite-map.png); }\n";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "images/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });

  it("sprite-position()", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'images/*');" +
                ".test{foo: sprite-position($test-sprite-map, 'images/img02.png') }";
    var expected = ".test {\n  foo: -105px -250px; }\n";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "images/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });

  it("sprite-position-x()", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'images/*');" +
                ".test{foo: sprite-position-x($test-sprite-map, 'images/img02.png') }";
    var expected = ".test {\n  foo: -105px; }\n";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "images/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });

  it("sprite-position-y()", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'images/*');" +
                ".test{foo: sprite-position-y($test-sprite-map, 'images/img02.png') }";
    var expected = ".test {\n  foo: -250px; }\n";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "images/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });

  it("sprite-width()", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'images/*');" +
                ".test{foo: sprite-width($test-sprite-map, 'images/img02.png') }";
    var expected = ".test {\n  foo: 50px; }\n";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "images/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });

  it("sprite-height()", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'images/*');" +
                ".test{foo: sprite-height($test-sprite-map, 'images/img02.png') }";
    var expected = ".test {\n  foo: 50px; }\n";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "images/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });

  it("sprite-map-width()", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'images/*');" +
                ".test{foo: sprite-map-width($test-sprite-map) }";
    var expected = ".test {\n  foo: 360px; }\n";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "images/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });

  it("sprite-map-height()", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'images/*');" +
                ".test{foo: sprite-map-height($test-sprite-map) }";
    var expected = ".test {\n  foo: 300px; }\n";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "images/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });

  it("sprite-background mixin", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'images/*');" +
                ".test{@include sprite-background($test-sprite-map) }";
    var expected = ".test {\n  background: url(/spritemaps/test-sprite-map.png) no-repeat; }\n";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "images/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });

  it("sprite-position mixin", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'images/*');" +
                ".test{@include sprite-position($test-sprite-map, 'images/img02.png') }";
    var expected = ".test {\n  background-position: -105px -250px; }\n";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "images/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });

  it("sprite-layout() throws error for invalid layout", function (done) {
    var options = {
      data: ".test {foo: sprite-layout(horizontal, (alignment: right, spacing: 5px)) }"
    };
    var expectedError = "error in C function sprite-layout: Error: Invalid layout alignment: " +
                        "'right'.\n\nBacktrace:\n\tstdin:1, in function `sprite-layout`\n\tstdin:1";

    testutils.assertCompilationError(options, expectedError, done);
  });

  it("sprite-layout() throws error for invalid strategy", function (done) {
    var options = {
      data: ".test {foo: sprite-layout(horizntal, (alignment: right, spacing: 5px)) }"
    };
    var expectedError = "error in C function sprite-layout: Error: Invalid layout strategy: " +
                        "'horizntal'.\n\nBacktrace:\n\tstdin:1, in function `sprite-layout`" +
                        "\n\tstdin:1";

    testutils.assertCompilationError(options, expectedError, done);
  });

  it("sprite-identifier()", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'images/*');" +
                ".test{foo: sprite-identifier($test-sprite-map, 'images/img02.png') }";
    var expected = ".test {\n  foo: img02; }\n";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "images/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });

  it("small images", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'smallimages/*');" +
                ".test {foo: sprite-url($test-sprite-map); }";
    var expected = ".test {\n  foo: url(/spritemaps/test-sprite-map.png); }\n";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "smallimages/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });

  it("lots of images", function (done) {
    var input = "@import 'assets'; @import 'spriting'; " +
                "$test-sprite-map: sprite-map('test-sprite-map', sprite-layout(horizontal, " +
                "(spacing: 5px, alignment: bottom)), 'lotsofimages/*');" +
                ".test {foo: sprite-url($test-sprite-map); }";
    var expected = ".test {\n  foo: url(/spritemaps/test-sprite-map.png); }\n";

    var rootDir = fixtureDirectory("app_assets");

    testutils.assertCompiles({
      data: input,
      eyeglass: {
        root: rootDir,
        assets: {
          sources: [{directory: rootDir, pattern: "lotsofimages/**/*"}]
        },
        engines: {
          sass: sass
        }
      }
    }, expected, done);
  });
});
