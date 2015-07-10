/*
 * Functions for creating a SpriteMap object, getting information about sprites,
 * and creating the spritemap image
 */

// var crypto = require("crypto");
var fs = require("fs");
var path = require("path");
var lwip = require("lwip");
var Layout = require("./Layout");
var sass = require("node-sass");
var sassUtils = require("node-sass-utils")(sass);

var getLastModifiedDate = function(filename) {
  return fs.statSync(filename).mtime.getTime();
}

var getIdentifier = function(filename) {
  return path.basename(filename, path.extname(filename));
}

// imagePaths = 2D array of image asset paths and real paths
// sassLayout and sources are Sass maps
function SpriteMap(name, imagePaths, sassLayout, sources) {
	if (imagePaths.size <= 0) {
		throw new Error("no images found!");
	}

	this.name = name;
	this.sassLayout = sassLayout;
	this.layout = new Layout(sassLayout);
	this.sources = sources;

	this.sprites = [];
	this.width = 0;
	this.height = 0;

	// sort imagePaths to make sprite map creation stable
	// use Array.from(imagePaths) ?

	var imagePathsArray = [];
	imagePaths.forEach(function(filepath, source) {
		imagePathsArray.push([source, filepath]);
	});

	imagePathsArray.sort(function(a, b) {
		if (a[0] === b[0]) return 0;
		else return (a[0] < b[0]) ? -1 : 1;
	});

	imagePaths = new Map(imagePathsArray);

	var self = this;
	var imageFileRegexp = /\.(gif|jpg|jpeg|png)$/i;

	imagePaths.forEach(function(filepath, source) {
		if (!filepath.match(imageFileRegexp)) {
			throw new Error("asset \'" + spriteNames[i] + "\' cannot be opened!");
		} else {
			self.sprites.push({
				'name' : source,
				'filename' : filepath
			});
		}
	});
}

// get width, height, last modified date for each sprite
SpriteMap.prototype.getData = function(cb) {
	var self = this;
	var imageFileRegexp = /\.(gif|jpg|jpeg|png)$/i;

	var aux = function(index) {
		if (index < self.sprites.length) {
			lwip.open(self.sprites[index].filename, function(err, image) {
				if (err) cb(err, null);

				self.sprites[index].width = image.width();
				self.sprites[index].height = image.height();

				try {
					self.sprites[index].lastModified = getLastModifiedDate(self.sprites[index].filename);
					aux(index + 1);
				} catch (err) {
					cb(err, null)
				}

			});
		} else {
			cb(null, self.sprites);
		}
	}

	aux(0);
}

// extract width, height, last modified date for each sprite given a Sass map with this information
SpriteMap.prototype.getDataFromSass = function(sassSpritemap) {
	this.width = sassSpritemap.coerce.get("width").value;
  this.height = sassSpritemap.coerce.get("height").value;

  var assets = sassSpritemap.coerce.get("assets");
  for (var i = 0; i < this.sprites.length; i++) {
    var sprite = assets.coerce.get(this.sprites[i].name);
    this.sprites[i].origin_x = -sprite.coerce.get("position")[0].value;
    this.sprites[i].origin_y = -sprite.coerce.get("position")[1].value;
    try {
    	this.sprites[i].lastModified = getLastModifiedDate(this.sprites[i].filename);
    } catch (err) {
    	throw err;
    }
  }
}

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
		var x = new sassUtils.SassDimension(-this.sprites[i].origin_x, "px");
    var y = new sassUtils.SassDimension(-this.sprites[i].origin_y, "px");
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
}

// get coordinates for each sprite & spritemap dimensions
SpriteMap.prototype.pack = function() {
	var dimensions = this.layout.pack(this.sprites);
	this.width 	= dimensions[0];
	this.height	= dimensions[1];
}

// save sprites data to file in json format
SpriteMap.prototype.saveData = function(filename, cb) {
	// if (!filename) {
	// 	filename = this.name + "_data.json";
	// }
	var data = {
		sprites: {},
		layout: this.layout
	};

	for (var i = 0; i < this.sprites.length; i++) {
		data.sprites[this.sprites[i].name] = this.sprites[i];
	}

	fs.writeFile(filename, JSON.stringify(data, null, 2), function(err) {
		if (err)	cb(err, null);
		else  		cb(null, data);
	});
}

// check if spritemap image needs to be updated
SpriteMap.prototype.needsUpdating = function() {
	var imageFile = path.join("assets", this.name + ".png");
	var dataFile = path.join("assets", this.name + ".json");

	try {
		spritemapDate = getLastModifiedDate(imageFile);
		var data = JSON.parse(fs.readFileSync(dataFile), 'utf8');

		// check if layout has changed
		if (data.layout.strategy != this.layout.strategy
			|| data.layout.spacing != this.layout.spacing
			|| data.layout.alignment != this.layout.alignment) {
			return true;
		}

		// check if number sprites is different
		if (this.sprites.length != Object.keys(data.sprites).length) {
			return true;
		}

		// check if source images have been modified
		for (var i = 0; i < this.sprites.length; i++) {
			if (!data.sprites[this.sprites[i].name]
				|| this.sprites[i].lastModified != data.sprites[this.sprites[i].name]["lastModified"]
				|| this.sprites[i].lastModified > spritemapDate) {
				return true;
			}
		}

	} catch (err) {
		// spritemap image does not already exist
		return true;
	}

	return false;
}


// create spritemap image, only it does not already exist or is out of date
SpriteMap.prototype.createSpriteMap = function(filename, cb) {
	var self = this;

	if (this.needsUpdating()) {
		var pasteImages = function(index, cur_spritemap) {
			if (index < self.sprites.length) {
				lwip.open(self.sprites[index].filename, function(err, image) {
					var origin_x = self.sprites[index].origin_x;
					var origin_y = self.sprites[index].origin_y;
					cur_spritemap.paste(origin_x, origin_y, image, function(err, new_spritemap) {
						pasteImages(index + 1, new_spritemap);
					});
				});
			} else {
				cur_spritemap.writeFile(filename, function(err) {
					if (err) cb(err, null);
					else {
						// TODO: change this after integrating with assets
						self.saveData(path.join("assets", self.name + ".json"), function(err, data) {
							cb(null, cur_spritemap);
						})
					}
				});
			}
		}

		lwip.create(self.width, self.height, function(err, spritemap) {
			if (err) cb(err, null);
			pasteImages(0, spritemap);
		});
	} else {
		cb(null, null); // spritemap is already up to date
	}
}

module.exports = SpriteMap;
