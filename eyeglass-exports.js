var path = require("path");
var SpriteMap = require("./SpriteMap");
var l = require("./Layout");

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
      "sprite-map($name, $layout, $paths...)": function(name, layout, paths, done) {
        var name = name.getValue();
        var layout = sassUtils.castToJs(layout);

        // TODO: check if spacing and alignment exist
        var spacing = layout.get(sass.types.String("spacing")).getValue();
        var alignment = layout.get(sass.types.String("alignment")).getValue();
        var layout = layout.get(sass.types.String("layout")).getValue();

        var layoutOptions = {
          alignment: alignment,
          spacing: spacing
        }

        var imagePaths = [];
        for (var i = 0; i < paths.getLength(); i++)
          imagePaths.push(paths.getValue(i).getValue());

        var sm = new SpriteMap(name, imagePaths);
        var layoutStyle = l.getLayoutStyle(layout, layoutOptions);

        sm.getData(function(err, data) {
          if (err) throw err;

          sm.pack(layoutStyle, spacing);

          sm.saveData(null, function(err, data) {
            if (err) throw err;
            console.log('*  wrote sprite data');
          });

          sm.createSpriteMap(null, function(err, spritemap) {
            if (err) throw err;
            console.log('*  created spritemap yay');
          });
        });

        done(sassUtils.castToSass(name + ".png"));
      },

      // TODO: check if options exist

      // sprite-layout(horizontal, (spacing: 5px, alignment: bottom))
      // --> (layout: horizontal, spacing: 50px, alignment: bottom)

      "sprite-layout($layout, $options)": function(layout, options, done) {
        var options = sassUtils.castToJs(options);
        var spacing = options.get(sass.types.String("spacing"));
        var alignment = options.get(sass.types.String("alignment"));

        var layoutSettings = new sassUtils.SassJsMap();
        layoutSettings.set(sass.types.String("layout"), layout);
        layoutSettings.set(sass.types.String("spacing"), spacing);
        layoutSettings.set(sass.types.String("alignment"), alignment);

        done(sassUtils.castToSass(layoutSettings));
      },

      "sprite-list()": function() {

      }

  	}
	}

};
