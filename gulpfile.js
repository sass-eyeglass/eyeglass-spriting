var gulp = require("gulp");

require("./build/lint")(gulp, []);
require("./build/test")(gulp, ["lint"]);
// require("./build/test")(gulp);

gulp.task("default", ["test"]);
