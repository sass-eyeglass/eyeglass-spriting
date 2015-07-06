var SpriteMap = require("./SpriteMap");
var Layout = require("./Layout");
var path = require("path");
var fs = require("fs");
var minimatch = require("minimatch");

// var getDataFileName = function(spritemapName) {
//   return path.join("assets", spritemapName + ".json");
// }

// TODO: integrate with eyeglass assets
var getImageFileName = function(spritemapName) {
  return path.join("assets", spritemapName + ".png");
}

module.exports = function(eyeglass, sass) {
  var sassUtils = require("node-sass-utils")(sass);

  // TODO: integrate with eyeglass assets
  var getRealPaths = function(paths, registeredAssets) {
    imagePaths = [];
    sources = [];
    registeredAssets = sassUtils.castToJs(registeredAssets);

    for (var i = 0; i < paths.getLength(); i++) {
      var nextPath = paths.getValue(i).getValue();

      registeredAssets.forEach(function(i, module) {
        module = sassUtils.castToJs(module);
        var assets = registeredAssets.coerce.get(module);
        assets.forEach(function(j, virtualPath) {
          var fullVirtualPath = path.join(module, sassUtils.castToJs(virtualPath));
          if (minimatch(fullVirtualPath, nextPath)) {
            var realPath = sassUtils.castToJs(assets.coerce.get(virtualPath));
            imagePaths.push([fullVirtualPath, realPath]);
            sources.push(fullVirtualPath);
          }
        });
      });
    }

    return imagePaths;
  }

  return {
    sassDir: path.join(__dirname, "sass"),
    functions: {
      // create sprite map and return Sass map of sprites information
      "sprite-map-assets($name, $layout, $registeredAssets, $paths...)": function(name, layout, registeredAssets, paths, done) {
        sassUtils.assertType(name, "string");
        sassUtils.assertType(layout, "map");
        sassUtils.assertType(registeredAssets, "map");
        sassUtils.assertType(paths, "list");

        var name = name.getValue();
        var imagePaths = getRealPaths(paths, registeredAssets);

        var sm = new SpriteMap(name, imagePaths, layout, paths);

        sm.getData(function(err, data) {
          if (err)
            done(sass.types.Error(err.toString()));

          sm.pack();
          done(sm.getSassData().toSassMap());
        });
      },

      // sprite-layout(horizontal, (spacing: 5px, alignment: bottom))
      // --> (layout: horizontal, spacing: 50px, alignment: bottom)
      "sprite-layout($strategy, $options)": function(strategy, options, done) {
        var spacing;
        var alignment;

        if (!sassUtils.isEmptyMap(options)) {
          options = sassUtils.castToJs(options);
          spacing = options.coerce.get("spacing");
          alignment = options.coerce.get("alignment");
        }

        if (!spacing) spacing = new sassUtils.SassDimension(0, "px");
        else spacing = spacing.convertTo("px", "");

        var layout = new sassUtils.SassJsMap();
        layout.coerce.set("strategy", strategy);
        if (spacing)
          layout.coerce.set("spacing", spacing);
        if (alignment)
          layout.coerce.set("alignment", alignment);

        try {
          new Layout(layout);
        } catch (e) {
          done(sass.types.Error(e.toString()));
        }

        done(sassUtils.castToSass(layout));
      },

      "sprite-list($spritemap)": function(spritemap, done) {
        sprites = sassUtils.castToJs(spritemap).coerce.get("assets");
        var spriteList = [];

        sprites.forEach(function(i, sprite) {
          spriteList.push(sassUtils.castToJs(sprite));
        });

        done(sassUtils.castToSass(spriteList));
      },

      // creates the sprite map image
      "sprite-url-assets($spritemap, $registeredAssets)": function(spritemap, registeredAssets, done) {
        spritemap = sassUtils.castToJs(spritemap);

        var name = spritemap.coerce.get("name");
        var layout = spritemap.coerce.get("layout");
        var sources = spritemap.get(sass.types.String("sources"));
        var imagePaths = getRealPaths(sources, registeredAssets);

        var sm = new SpriteMap(name, imagePaths, layout, sources);

        sm.getDataFromSass(spritemap);

        sm.createSpriteMap(getImageFileName(name), function(err, spritemap) {
          if (err) throw err;
          // TODO: change this after integrating with assets
          var url = path.join("..", getImageFileName(name));
          done(sassUtils.castToSass(url));
        });
      },

      "sprite-position($spritemap, $spritename)": function(spritemap, spritename, done) {
        var assets = sassUtils.castToJs(spritemap).coerce.get("assets");
        var sprite = assets.coerce.get(spritename);

        var position = sprite.coerce.get("position");
        position = sassUtils.castToSass(position);
        position.setSeparator = false;

        done(position);
      },

      "sprite-position-x($spritemap, $spritename)": function(spritemap, spritename, done) {
        var assets = sassUtils.castToJs(spritemap).coerce.get("assets");
        var sprite = assets.coerce.get(spritename);
        var position_x = sprite.coerce.get("position")[0];

        done(sassUtils.castToSass(position_x));
      },

      "sprite-position-y($spritemap, $spritename)": function(spritemap, spritename, done) {
        var assets = sassUtils.castToJs(spritemap).coerce.get("assets");
        var sprite = assets.coerce.get(spritename);
        var position_y = sprite.coerce.get("position")[1];

        done(sassUtils.castToSass(position_y));
      },

      "sprite-width($spritemap, $spritename)": function(spritemap, spritename, done) {
        var assets = sassUtils.castToJs(spritemap).coerce.get("assets");
        var sprite = assets.coerce.get(spritename);
        var width = sprite.coerce.get("width");

        done(sassUtils.castToSass(width));
      },

      "sprite-height($spritemap, $spritename)": function(spritemap, spritename, done) {
        var assets = sassUtils.castToJs(spritemap).coerce.get("assets");
        var sprite = assets.coerce.get(spritename);
        var height = sprite.coerce.get("height");

        done(sassUtils.castToSass(height));
      },

      "sprite-map-width($spritemap)": function(spritemap, done) {
        var width = sassUtils.castToJs(spritemap).coerce.get("width");
        done(sassUtils.castToSass(width));
      },

      "sprite-map-height($spritemap)": function(spritemap, done) {
        var height = sassUtils.castToJs(spritemap).coerce.get("height");
        done(sassUtils.castToSass(height));
      },

      // TODO: re-write this later; this is placeholder to make example project work
      // "module-a/icons/home.png" -> returns "home"
      // TODO: get identifier from map passed in
      // TODO: raise an error if called for an image that has no specified identifer and
      // the base filename is not a legal css ident.
      "sprite-identifier($spritemap, $spritename)": function(spritemap, spritename, done) {
        var name = spritename.getValue();
        var identifier = path.basename(name, path.extname(name));

        done(sassUtils.castToSass(identifier));
      }

  	}
	}

};
