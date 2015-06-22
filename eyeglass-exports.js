var path = require("path");
var SpriteMap = require("./SpriteMap");
var l = require("./Layout");
var fs = require("fs");

var getDataFileName = function(spritemapName) {
  return spritemapName + ".json";
}

var getImageFileName = function(spritemapName) {
  return spritemapName + ".png";
}

module.exports = function(eyeglass, sass) {
  var sassUtils = require("node-sass-utils")(sass);

  return {
    sassDir: path.join(__dirname, "sass"),
    functions: {

      "hello-assets()": function(done) {
        done(sassUtils.castToSass("hello assets"));
      },

      // create sprite map and return url
      // layout = sass map of layout style, alignment, spacing
      // TODO check conversion from other units to px?
      // returns spritemap name (name parameter)
      "sprite-map($name, $layout, $paths...)": function(name, layout, paths, done) {
        var name = name.getValue();
        var layout = sassUtils.castToJs(layout);

        var spacing = layout.coerce.get("spacing").value;
        var alignment = layout.coerce.get("alignment");
        var layout = layout.coerce.get("layout");

        var layoutOptions = {};
        if (spacing)
          layoutOptions.spacing = spacing;
        if (alignment)
          layoutOptions.alignment = alignment;

        var imagePaths = [];
        for (var i = 0; i < paths.getLength(); i++)
          imagePaths.push(paths.getValue(i).getValue());

        var sm = new SpriteMap(name, imagePaths);
        var layoutStyle = l.getLayoutStyle(layout, layoutOptions);

        sm.getData(function(err, data) {
          if (err) throw err;

          sm.pack(layoutStyle, spacing);

          sm.saveData(getDataFileName(name), function(err, data) {
            if (err) throw err;
            console.log('*  wrote sprite data');
          });

          sm.createSpriteMap(getImageFileName(name), function(err, spritemap) {
            if (err) throw err;
            console.log('*  created spritemap yay');
          });
        });

        done(sassUtils.castToSass(name));
      },

      // sprite-layout(horizontal, (spacing: 5px, alignment: bottom))
      // --> (layout: horizontal, spacing: 50px, alignment: bottom)
      "sprite-layout($layout, $options)": function(layout, options, done) {
        var options = sassUtils.castToJs(options);

        var spacing = sassUtils.castToJs(options.coerce.get("spacing"));
        // if (spacing) spacing = spacing.convertTo("px", "");
        var alignment = options.coerce.get("alignment");

        // TODO: check if options are valid

        if (!alignment) {
          if (layout.getValue() == "vertical")
            alignment = "left";
          else if (layout.getValue() == "horizontal")
            alignment = "right";
        }

        var layoutSettings = new sassUtils.SassJsMap();
        layoutSettings.coerce.set("layout", layout);
        if (spacing)
          layoutSettings.coerce.set("spacing", spacing);
        if (alignment)
          layoutSettings.coerce.set("alignment", alignment);

        done(sassUtils.castToSass(layoutSettings));
      },

      "sprite-list($spritemap)": function(spritemap, done) {
        var filename = getDataFileName(spritemap.getValue());
        var outputStr = "";

        fs.readFile(filename, 'utf8', function(err, data) {
          if (err) throw err;
          data = JSON.parse(data);

          for (var sprite in data) {
            outputStr += data[sprite]["name"] + "\n";
          }

          done(sassUtils.castToSass(outputStr));
        });
      },

      "sprite-url($spritemap)": function(spritemap, done) {
        var url = getImageFileName(spritemap.getValue());
        done(sassUtils.castToSass(url));
      },

      "sprite-position($spritemap, $spritename)": function(spritemap, spritename, done) {
        var filename = getDataFileName(spritemap.getValue());

        fs.readFile(filename, 'utf8', function(err, data) {
          if (err) throw err;
          data = JSON.parse(data);

          var x = new sassUtils.SassDimension(data[spritename.getValue()]["origin_x"], "px");
          var y = new sassUtils.SassDimension(data[spritename.getValue()]["origin_y"], "px");

          output = sassUtils.castToSass([x, y]);
          output.setSeparator(false);

          done(output);
        });
      },

      "sprite-position-x($spritemap, $spritename)": function(spritemap, spritename, done) {
        var filename = getDataFileName(spritemap.getValue());

        fs.readFile(filename, 'utf8', function(err, data) {
          if (err) throw err;
          data = JSON.parse(data);

          var output = new sassUtils.SassDimension(data[spritename.getValue()]["origin_x"], "px");

          done(sassUtils.castToSass(output));
        });
      },

      "sprite-position-y($spritemap, $spritename)": function(spritemap, spritename, done) {
        var filename = getDataFileName(spritemap.getValue());

        fs.readFile(filename, 'utf8', function(err, data) {
          if (err) throw err;
          data = JSON.parse(data);

          var output = new sassUtils.SassDimension(data[spritename.getValue()]["origin_y"], "px");

          done(sassUtils.castToSass(output));
        });
      },

      "sprite-width($spritemap, $spritename)": function(spritemap, spritename, done) {
        var filename = getDataFileName(spritemap.getValue());

        fs.readFile(filename, 'utf8', function(err, data) {
          if (err) throw err;
          data = JSON.parse(data);

          var output = new sassUtils.SassDimension(data[spritename.getValue()]["width"], "px");

          done(sassUtils.castToSass(output));
        });
      },

      "sprite-height($spritemap, $spritename)": function(spritemap, spritename, done) {
        var filename = getDataFileName(spritemap.getValue());

        fs.readFile(filename, 'utf8', function(err, data) {
          if (err) throw err;
          data = JSON.parse(data);

          var output = new sassUtils.SassDimension(data[spritename.getValue()]["height"], "px");

          done(sassUtils.castToSass(output));
        });
      },

      "sprite-identifier($spritemap, $spritename)": function(spritemap, spritename, done) {

      }

  	}
	}

};
