var path = require("path");
var SpriteMap = require("./SpriteMap");
var Layout = require("./Layout");
var fs = require("fs");
var minimatch = require("minimatch");

var getDataFileName = function(spritemapName) {
  return path.join("assets", spritemapName + ".json");
}

var getImageFileName = function(spritemapName) {
  return path.join("assets", spritemapName + ".png");
}

module.exports = function(eyeglass, sass) {
  var sassUtils = require("node-sass-utils")(sass);

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

        var layoutJs = sassUtils.castToJs(layout);
        var spacing = layoutJs.coerce.get("spacing").value;
        var alignment = layoutJs.coerce.get("alignment");
        var strategy = layoutJs.coerce.get("strategy");

        // TODO: sass cast to object?
        var layoutOptions = {};
        if (spacing)
          layoutOptions.spacing = spacing;
        if (alignment)
          layoutOptions.alignment = alignment;

        var layoutStyle = new Layout(strategy, layoutOptions);

        // convert asset paths to real paths
        var registeredAssets = sassUtils.castToJs(registeredAssets);
        var imagePaths = [];
        var sources = [];

        // TODO: use assets to get real paths
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

        var spritemap = new sassUtils.SassJsMap();
        spritemap.coerce.set("sprite-map", true);
        spritemap.coerce.set("name", name);
        spritemap.coerce.set("sources", sassUtils.castToSass(paths));
        spritemap.coerce.set("layout", layout);
        // TODO: put this into helper function in SpriteMap
        var sm = new SpriteMap(name, imagePaths);
        sm.getData(function(err, data) {
          if (err) throw err;

          sm.pack(layoutStyle);

          var assets = new sassUtils.SassJsMap();

          for (var i = 0; i < sm.sprites.length; i++) {
            // TODO: should this be in Layout.js?
            var x = new sassUtils.SassDimension(-sm.sprites[i].origin_x, "px");
            var y = new sassUtils.SassDimension(-sm.sprites[i].origin_y, "px");
            var position = sassUtils.castToSass([x, y]);
            position.setSeparator(false);

            var width = new sassUtils.SassDimension(sm.sprites[i].width, "px");
            var height = new sassUtils.SassDimension(sm.sprites[i].height, "px");

            var sprite = new sassUtils.SassJsMap();
            sprite.coerce.set("path", sm.sprites[i].filename);
            sprite.coerce.set("position", position);
            sprite.coerce.set("width", width);
            sprite.coerce.set("height", height);

            assets.coerce.set(sm.sprites[i].name, sprite);
          }

          spritemap.coerce.set("assets", assets);

          done(spritemap.toSassMap());
        });
      },

      // sprite-layout(horizontal, (spacing: 5px, alignment: bottom))
      // --> (layout: horizontal, spacing: 50px, alignment: bottom)
      // TODO:
      "sprite-layout($strategy, $options)": function(strategy, options, done) {
        var options = sassUtils.castToJs(options);
        var spacing;
        var alignment;

        // no options specified
        // TODO: use handle empty map thing from node-sass-utils
        if (sassUtils.typeOf(options) != "map") {
          spacing = new sassUtils.SassDimension(0, "px");
          alignment = "";
        } else {
          spacing = options.coerce.get("spacing");
          if (!spacing) spacing = new sassUtils.SassDimension(0, "px");
          // else spacing = spacing.convertTo("px", "");
          alignment = options.coerce.get("alignment");
        }

        // check if options are valid
        switch (sassUtils.castToJs(strategy)) {
          case "vertical":
            if (!alignment) alignment = "left";
            // TODO: throw error
            else if (alignment != "left" && alignment != "right") alignment = "left";
            break;
          case "horizontal":
            if (!alignment) alignment = "top";
            // TODO: throw error
            else if (alignment != "top" && alignment != "bottom") alignment = "top";
            break;
          case "diagonal":
            break;
          default:
          // TODO: throw error
            strategy = "vertical";
            alignment = "left";
            break;
        }

        var layoutSettings = new sassUtils.SassJsMap();
        layoutSettings.coerce.set("strategy", strategy);
        if (spacing)
          layoutSettings.coerce.set("spacing", spacing);
        if (alignment)
          layoutSettings.coerce.set("alignment", alignment);

        done(sassUtils.castToSass(layoutSettings));
      },

      "sprite-list($spritemap)": function(spritemap, done) {
        sprites = sassUtils.castToJs(spritemap).coerce.get("assets");
        var spriteList = [];

        // TODO: make this a list instead of a string
        sprites.forEach(function(i, sprite) {
          // sprite = sassUtils.castToJs(sprite);
          spriteList.push(sassUtils.castToJs(sprite));
          // outputStr += sprite + "\n";
        });

        done(sassUtils.castToSass(spriteList));
      },

      "sprite-url($spritemap)": function(spritemap, done) {
        var name = sassUtils.castToJs(spritemap).coerce.get("name");

        // get paths
        var imagePaths = [];
        var sprites = sassUtils.castToJs(spritemap).coerce.get("assets");
        sprites.forEach(function(spriteData, spriteName) {
          spriteData = sassUtils.castToJs(spriteData);
          var virtualPath = sassUtils.castToJs(spriteName);
          var realPath = spriteData.coerce.get("path");
          imagePaths.push([virtualPath, realPath]);
        });

        // get layout
        var layout = sassUtils.castToJs(spritemap).coerce.get("layout");
        var spacing = layout.coerce.get("spacing").value;
        var alignment = layout.coerce.get("alignment");
        var strategy = layout.coerce.get("strategy");

        var layoutOptions = {};
        if (spacing)
          layoutOptions.spacing = spacing;
        if (alignment)
          layoutOptions.alignment = alignment;

        var layoutStyle = new Layout(strategy, layoutOptions);

        var sm = new SpriteMap(name, imagePaths);

        sm.getData(function(err, data) {
          sm.pack(layoutStyle);

          sm.createSpriteMap(getImageFileName(name), function(err, spritemap) {
            if (err) throw err;
            // TODO: wat do
            var url = path.join("..", getImageFileName(name));
            // var url = getImageFileName(name);
            done(sassUtils.castToSass(url));
          });
        })
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
        var width = sprite.coerce.get("width")

        done(sassUtils.castToSass(width));
      },

      "sprite-height($spritemap, $spritename)": function(spritemap, spritename, done) {
        var assets = sassUtils.castToJs(spritemap).coerce.get("assets");
        var sprite = assets.coerce.get(spritename);
        var height = sprite.coerce.get("height")

        done(sassUtils.castToSass(height));
      },

      // TODO: re-write this later; this is placeholder
      // TODO: raises an error if called for an image that has no specified identifer and
      // the base filename is not a legal css ident.
      "sprite-identifier($spritemap, $spritename)": function(spritemap, spritename, done) {
        var name = spritename.getValue();
        var identifier = path.basename(name, path.extname(name));

        done(sassUtils.castToSass(identifier));
      }

  	}
	}

};
