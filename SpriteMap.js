"use strict";
/*
 * Functions for creating a SpriteMap object, getting information about sprites,
 * and creating the spritemap image
 */

// var crypto = require("crypto");
var fs = require("fs");
var path = require("path");
var lwip = require("lwip");
var ly = require("./Layout");
var sass = require("node-sass");
var sassUtils = require("node-sass-utils")(sass);

var printTiming = false;
var useMetadata = true;
// var useMetadata = false;

var getLastModifiedDate = function(filename) {
  return fs.statSync(filename).mtime.getTime();
};

var getIdentifier = function(filename) {
  return path.basename(filename, path.extname(filename));
};

// imagePaths = 2D array of image asset paths and real paths
// sassLayout and sources are Sass maps
function SpriteMap(name, paths, sassLayout, sources) {
  if (paths.size <= 0) {
    throw new Error("no images found!");
  }

  this.name = name;
  this.sassLayout = sassLayout;
  // this.layout = new Layout.Layout(sassLayout);
  this.layout = ly.getLayout(sassLayout);
  this.sources = sources;

  this.sprites = [];
  this.width = 0;
  this.height = 0;

  // sort imagePaths keys to make sprite map creation stable
  var pathsIter = paths.keys();
  var pathsKeys = [];
  var nextPath = pathsIter.next();

  for (nextPath; !nextPath.done; nextPath = pathsIter.next()) {
    pathsKeys.push(nextPath.value);
  }

  pathsKeys.sort();

  var imageFileRegexp = /\.(gif|jpg|jpeg|png)$/i;
  for (var i = 0; i < pathsKeys.length; i++) {
    var source = pathsKeys[i];
    var filepath = paths.get(source);

    if (!filepath.match(imageFileRegexp)) {
      throw new Error("asset \'" + source + "\' cannot be opened!");
    } else {
      this.sprites.push({
        "name": source,
        "filename": filepath
      });
    }
  }
}

// get width, height, last modified date for each sprite
SpriteMap.prototype.getData = function(cb) {
  var self = this;

  var aux = function(index) {
    if (index < self.sprites.length) {
      lwip.open(self.sprites[index].filename, function(err, image) {
        if (err) {
          cb(err, null);
        }

        self.sprites[index].width = image.width();
        self.sprites[index].height = image.height();

        try {
          self.sprites[index].lastModified
            = getLastModifiedDate(self.sprites[index].filename);
          aux(index + 1);
        } catch (error) {
          cb(error, null);
        }

      });
    } else {
      cb(null, self.sprites);
    }
  };

  aux(0);
};

// extract width, height, last modified date for each sprite given a Sass map with this information
SpriteMap.prototype.getDataFromSass = function(sassSpritemap) {
  this.width = sassSpritemap.coerce.get("width").value;
  this.height = sassSpritemap.coerce.get("height").value;

  var assets = sassSpritemap.coerce.get("assets");
  for (var i = 0; i < this.sprites.length; i++) {
    var sprite = assets.coerce.get(this.sprites[i].name);
    this.sprites[i].originX = -sprite.coerce.get("position")[0].value;
    this.sprites[i].originY = -sprite.coerce.get("position")[1].value;
    try {
      this.sprites[i].lastModified = getLastModifiedDate(this.sprites[i].filename);
    } catch (err) {
      throw err;
    }
  }
};

// construct a Sass map containing information for this sprite map
// should only be called after getData and pack
SpriteMap.prototype.getSassData = function() {
  this.sassData = new sassUtils.SassJsMap();

  this.sassData.coerce.set("sprite-map", true);
  this.sassData.coerce.set("name", this.name);
  this.sassData.coerce.set("sources", this.sources);
  this.sassData.coerce.set("layout", this.sassLayout);

  var assets = new sassUtils.SassJsMap();

  for (var i = 0; i < this.sprites.length; i++) {
    var x = new sassUtils.SassDimension(-this.sprites[i].originX, "px");
    var y = new sassUtils.SassDimension(-this.sprites[i].originY, "px");
    var position = sassUtils.castToSass([x, y]);
    position.setSeparator(false);

    var width = new sassUtils.SassDimension(this.sprites[i].width, "px");
    var height = new sassUtils.SassDimension(this.sprites[i].height, "px");

    var sprite = new sassUtils.SassJsMap();
    sprite.coerce.set("path", this.sprites[i].filename);
    sprite.coerce.set("identifier", getIdentifier(this.sprites[i].name));
    sprite.coerce.set("position", position);
    sprite.coerce.set("width", width);
    sprite.coerce.set("height", height);

    assets.coerce.set(this.sprites[i].name, sprite);
  }

  this.sassData.coerce.set("assets", assets);
  this.sassData.coerce.set("width", new sassUtils.SassDimension(this.width, "px"));
  this.sassData.coerce.set("height", new sassUtils.SassDimension(this.height, "px"));

  return this.sassData;
};

// get coordinates for each sprite & spritemap dimensions
SpriteMap.prototype.pack = function(dir) {
  var self = this;
  this.needsUpdating(dir, function(result) {
    if (result.needsUpdating) {
      var t0 = Date.now();
      var dimensions = self.layout.pack(self.sprites);
      var t1 = Date.now();
      var elapsed = t1 - t0;
      if (printTiming) {
        console.log("packing:            " + elapsed + " ms.");
      }
      self.width = dimensions[0];
      self.height = dimensions[1];
    } else { // read in positions
      for (var i = 0; i < self.sprites.length; i++) {
        self.sprites[i].originX = result.data.sprites[self.sprites[i].name].originX;
        self.sprites[i].originY = result.data.sprites[self.sprites[i].name].originY;
      }
    }
  });
};

SpriteMap.prototype.getSpritesDataStr = function() {
  var data = {
    sprites: {},
    layout: this.layout
  };

  for (var i = 0; i < this.sprites.length; i++) {
    var spriteData = this.sprites[i];
    delete spriteData.filename;
    data.sprites[this.sprites[i].name] = spriteData;
  }

  return JSON.stringify(data, null, 2);
};

// save sprites data to file in json format
SpriteMap.prototype.saveData = function(filename, cb) {
  var dataStr = this.getSpritesDataStr();

  fs.writeFile(filename, dataStr, function(err) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, dataStr);
    }
  });
};

// check if spritemap image needs to be updated
SpriteMap.prototype.needsUpdating = function(dir, cb) {
  try {
    var imageFile = path.join(dir, this.name + ".png");
    var spritemapDate = getLastModifiedDate(imageFile);
    var self = this;

    lwip.open(imageFile, function(err, image) {
      if (err) {
        // console.log("*** problem opening sprite map image");
        cb({needsUpdating: true});
      }

      var metadata;

      if (image.setMetadata && image.getMetadata && useMetadata) {
        metadata = image.getMetadata();
      } else {
        try {
          metadata = fs.readFileSync(path.join(dir, self.name + ".json"));
        } catch (error) {
          cb({needsUpdating: true});
        }
      }

      // console.log("metadata: " + metadata);

      if (!metadata) {
        // console.log("*** no metadata found");
        cb({needsUpdating: true});
        return;
      }

      var data = JSON.parse(metadata, "utf8");

      // check if number sprites is different
      if (self.sprites.length !== Object.keys(data.sprites).length) {
        // console.log("*** sprites added/deleted");
        cb({needsUpdating: true});
        return;
      }

      // check if layout has changed
      if (data.layout.strategy !== self.layout.strategy
        || data.layout.spacing !== self.layout.spacing
        || data.layout.alignment !== self.layout.alignment) {
        // console.log("*** layout has changed");
        cb({needsUpdating: true});
        return;
      }

      // check if source images have been modified
      for (var i = 0; i < self.sprites.length; i++) {
        if (!data.sprites[self.sprites[i].name]
          || self.sprites[i].lastModified !== data.sprites[self.sprites[i].name].lastModified
          || self.sprites[i].lastModified > spritemapDate) {
          // console.log("*** sources modified");
          cb({needsUpdating: true});
          return;
        }
      }

      cb({needsUpdating: false, data: data});
    });
  } catch(err) {
    // console.log("*** spritemap does not already exist");
    cb({needsUpdating: true});
  }
};

// create spritemap image, only if it does not already exist or is out of date
SpriteMap.prototype.createSpriteMap = function(dir, cb) {
  var t0 = Date.now();
  var self = this;
  this.needsUpdating(dir, function(result) {
    // result = true;
    if (result.needsUpdating) {
      // console.log("spritemap \'" + self.name + "\' is being regenerated");

      var pasteImages = function(index, curSpritemap) {
        if (index < self.sprites.length) {
          lwip.open(self.sprites[index].filename, function(err, image) {
            if (err) {
              cb(err, null);
            }
            var originX = self.sprites[index].originX;
            var originY = self.sprites[index].originY;
            curSpritemap.paste(originX, originY, image, function(pasteErr, newSpritemap) {
              if (pasteErr) {
                cb(err, null);
              }
              pasteImages(index + 1, newSpritemap);
            });
          });
        } else {
          // save image with metadata
          if (curSpritemap.setMetadata && curSpritemap.getMetadata && useMetadata) {
            curSpritemap.setMetadata(self.getSpritesDataStr());
          } else {
            fs.writeFileSync(path.join(dir, self.name + ".json"), self.getSpritesDataStr());
          }

          curSpritemap.writeFile(path.join(dir, self.name + ".png"), function(err) {
            if (err) {
              cb(err, null);
            } else {
              var t1 = Date.now();
              var elapsed = t1 - t0;
              if (printTiming) {
                console.log("spritemap creation: " + elapsed + " ms.");
              }
              cb(null, curSpritemap);
            }
          });
        }
      };

      lwip.create(self.width, self.height, function(err, spritemap) {
        if (err) {
          cb(err, null);
        }
        pasteImages(0, spritemap);
      });
    } else {
      cb(null, null); // spritemap is already up to date
    }
  });

};

module.exports = SpriteMap;
