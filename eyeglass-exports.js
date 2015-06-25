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

      // "hello-assets()": function(done) {
      //   done(sassUtils.castToSass("hello assets"));
      // },

      // create sprite map and return url
      // layout = sass map of layout style, alignment, spacing
      // TODO check conversion from other units to px?
      // returns spritemap name (name parameter)
      "sprite-map-assets($name, $layout, $registeredAssets, $paths...)": function(name, layout, registeredAssets, paths, done) {
        var name = name.getValue();

        // get Layout
        var layoutJs = sassUtils.castToJs(layout);

        var spacing = layoutJs.coerce.get("spacing").value;
        var alignment = layoutJs.coerce.get("alignment");
        var strategy = layoutJs.coerce.get("strategy");

        var layoutOptions = {};
        if (spacing)
          layoutOptions.spacing = spacing;
        if (alignment)
          layoutOptions.alignment = alignment;

        var layoutStyle = new Layout(strategy, layoutOptions);

        // convert asset paths to real paths
        // TODO: clean this up?
        var registeredAssets = sassUtils.castToJs(registeredAssets);
        var imagePaths = [];
        var sources = [];

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

        // create sprite map
        var sm = new SpriteMap(name, imagePaths);
        sm.getData(function(err, data) {
          if (err) throw err;

          sm.pack(layoutStyle);

          // build map to return
          var spritemap = new sassUtils.SassJsMap();
          spritemap.coerce.set("sprite-map", true);
          spritemap.coerce.set("name", name);
          spritemap.coerce.set("sources", sassUtils.castToSass(paths));
          spritemap.coerce.set("layout", layout);

          var assets = new sassUtils.SassJsMap();
          for (var i = 0; i < sm.sprites.length; i++) {
            var x = new sassUtils.SassDimension(sm.sprites[i].origin_x, "px");
            var y = new sassUtils.SassDimension(sm.sprites[i].origin_y, "px");
            position = sassUtils.castToSass([x, y]);
            position.setSeparator(false);

            var sprite = new sassUtils.SassJsMap();
            sprite.coerce.set("path", sm.sprites[i].filename);
            sprite.coerce.set("position", position);

            var width = new sassUtils.SassDimension(sm.sprites[i].width, "px");
            sprite.coerce.set("width", width);

            var height = new sassUtils.SassDimension(sm.sprites[i].height, "px");
            sprite.coerce.set("height", height);

            // TOOD: change sprite name after switching to using assets
            assets.coerce.set(sm.sprites[i].name, sprite);
          }

          spritemap.coerce.set("assets", assets);
          spritemap.coerce.set("layout", layout);

          // sm.createSpriteMap(getImageFileName(name), function(err, spritemap) {
          //   if (err) throw err;
          //   // console.log('*  created spritemap yay');
          // });

          done(spritemap.toSassMap());
        });
      },

      // sprite-layout(horizontal, (spacing: 5px, alignment: bottom))
      // --> (layout: horizontal, spacing: 50px, alignment: bottom)
      "sprite-layout($strategy, $options)": function(strategy, options, done) {
        var options = sassUtils.castToJs(options);
        var spacing = sassUtils.castToJs(options.coerce.get("spacing"));
        // if (spacing) spacing = spacing.convertTo("px", "");
        var alignment = options.coerce.get("alignment");

        // check if options are valid
        switch (sassUtils.castToJs(strategy)) {
          case "vertical":
            if (!alignment) alignment = "left";
            else if (alignment != "left" && alignment != right) alignment = "left";
            break;
          case "horizontal":
            if (!alignment) alignment = "top";
            else if (alignment != "top" && alignment != "bottom") alignment = "top";
            break;
          case "diagonal":
            break;
          default:
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
        var outputStr = "";

        sprites.forEach(function(i, sprite) {
          sprite = sassUtils.castToJs(sprite);
          outputStr += sprite + "\n";
        });

        done(sassUtils.castToSass(outputStr));
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
            // console.log('*  created spritemap yay');
            done(sassUtils.castToSass(getImageFileName(name)));
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

      "sprite-identifier($spritemap, $spritename)": function(spritemap, spritename, done) {

      }

  	}
	}

};
