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

// imagePaths = 2D array of image asset paths and real paths
// TODO: do I really need to pass in sources
function SpriteMap(name, imagePaths, sassLayout, sources) {
	this.name = name;
	this.sassLayout = sassLayout;
	this.layout = new Layout(sassLayout);
	this.sources = sources;

	this.sprites = [];
	this.width = 0;
	this.height = 0;

	imagePaths.sort(function(a, b) {
		if (a[1] === b[1]) return 0;
		else return (a[1] < b[1]) ? -1 : 1;
	});

	var spriteNames = [];
	var spritePaths = [];

	for (var i = 0; i < imagePaths.length; i++) {
		spriteNames[i] = imagePaths[i][0];
		spritePaths[i] = imagePaths[i][1];
	}

	if (spritePaths.length <= 0)
		throw new Error("no images found!");

	var imageFileRegexp = /\.(gif|jpg|jpeg|png)$/i;

	for (var i = 0; i < spritePaths.length; i++) {
		if (!spritePaths[i].match(imageFileRegexp)) {
			throw new Error("asset \'" + spriteNames[i] + "\' cannot be opened!");
		}
		else {
			this.sprites.push({
				'name' : spriteNames[i],
				'filename' : spritePaths[i]
			})
		}
	}
}


// get sprite width, height, last modified date
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
	// data : { sprites: [], layout: } ?
	for (var i = 0; i < this.sprites.length; i++) {
		data.sprites[this.sprites[i].name] = this.sprites[i];
	}

	fs.writeFile(filename, JSON.stringify(data, null, 2), function(err) {
		if (err)	cb(err, null);
		else  		cb(null, data);
	});
}

// TODO: what if current sprites have duplicates that exist in json file?
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


// create spritemap image
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
				// all images have been pasted; save image to file
				cur_spritemap.writeFile(filename, function(err) {
					if (err) cb(err, null);
					else {
						// TODO: what file path to use?
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
