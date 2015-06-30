// var Layout 	= require('./Layout');
var glob = require("glob");
var fs = require("fs");
var path = require("path");
var lwip = require("lwip");
var crypto = require("crypto");
var sass = require("node-sass");
var sassUtils = require("node-sass-utils")(sass);
var Layout = require("./Layout");

var getSpriteName = function(imagesFolder, filePath) {
	var prefix = path.basename(imagesFolder);
	var filename = path.basename(filePath);
	return prefix + "-" + filename.substring(0, filename.indexOf('.'));
}

// imagePaths = array of images and/or folders containing images
// TODO: do I really need to pass in sources
function SpriteMap(name, imagePaths, sassLayout, sources) {
	// function SpriteMap(name, imagePaths) {
	this.name = name;
	this.sprites = [];
	this.filenames = [];
	this.sources = [];
	this.width = 0;
	this.height = 0;
	this.sassLayout = sassLayout;
	this.layout = new Layout(sassLayout);

	this.sassData = new sassUtils.SassJsMap();
	this.sassData.coerce.set("sprite-map", true);
	this.sassData.coerce.set("name", this.name);
	this.sassData.coerce.set("sources", sources);
	this.sassData.coerce.set("layout", this.sassLayout);

	function sortByRealPaths(a, b) {
		if (a[1] === b[1]) return 0;
		else return (a[1] < b[1]) ? -1 : 1;
	}

	for (var i = 0; i < imagePaths.length; i++) {
		this.filenames[i] = imagePaths[i][1];
		this.sources[i] = imagePaths[i][0];
	}

	var imageFileRegexp = /\.(gif|jpg|jpeg|png)$/i;

	// get all image files
	// for (var i = 0; i < imagePaths.length; i++) {
	// 	if (imagePaths[i].match(imageFileRegexp)) {
	// 		this.filenames.push(imagePaths[i]);
	// 	} else {
	// 		var newFiles = glob.sync(path.join(imagePaths[i], "**/*.+(png|jpg|jpeg|gif)"))
	// 		this.filenames = this.filenames.concat(newFiles);
	// 	}
	// }

	if (this.filenames.length <= 0)
		throw new Error("no images found!");

	for (var i = 0; i < this.filenames.length; i++) {
		if (!this.filenames[i].match(imageFileRegexp)) {
			throw new Error("asset \'" + this.sources[i] + "\' cannot be opened!");
		}
		else {
			this.sprites.push({
				'name' : this.sources[i],
				'filename' : this.filenames[i]
			})
		}
	}
}

var getLastModifiedDate = function(filename, cb) {
	fs.stat(filename, function(err, stats) {
    if (err) cb(err, null);
    else if (!stats) cb ("no file", null);
    else cb(null, stats.mtime.getTime());
  })
  // return fs.statSync(filename).mtime.getTime();
}

// get dimensions & hashes
SpriteMap.prototype.getData = function(cb) {
	var self = this;
	var imageFileRegexp = /\.(gif|jpg|jpeg|png)$/i;

	var aux = function(index) {
		if (index < self.sprites.length) {
			lwip.open(self.sprites[index].filename, function(err, image) {
				if (err) cb(err, null);

				var encodingFormat = self.sprites[index].filename.match(imageFileRegexp)[1];
				image.toBuffer(encodingFormat, function(err, buffer) {
					if (err) cb(err, null);

					self.sprites[index].width = image.width();
					self.sprites[index].height = image.height();
					self.sprites[index].md5sum = crypto.createHash("md5").update(buffer).digest('hex');

					getLastModifiedDate(self.sprites[index].filename, function(err, date) {
						if (err) cb(err, null);
						self.sprites[index].lastModified = date;
						aux(index + 1);
					});

				});
			});
		} else {
			cb(null, self.sprites);
		}
	}

	aux(0);
}

// should only be called after getData and pack
SpriteMap.prototype.getSassData = function() {
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
}

// get coordinates for each sprite & spritemap dimensions
SpriteMap.prototype.pack = function() {
// SpriteMap.prototype.pack = function(layoutStyle) {
	var dimensions = this.layout.pack(this.sprites);
	this.width 	= dimensions[0];
	this.height	= dimensions[1];
	this.getSassData();
}

// save sprites data to file in json format
SpriteMap.prototype.saveData = function(filename, cb) {

	if (!filename) {
		filename = this.name + "_data.json";
	}

	var data = {};
	for (var i = 0; i < this.sprites.length; i++) {
		data[this.sprites[i].name] = this.sprites[i];
	}

	fs.writeFile(filename, JSON.stringify(data, null, 2), function(err) {
		if (err)	cb(err, null);
		else  		cb(null, data);
	});
}

// currentSprites = array
// existingSprites = object
var needsUpdating = function(currentSprites, existingSprites, spritemapDate) {
	// TODO: check if other parameters have changed
	if (currentSprites.length != Object.keys(existingSprites).length) {
		return true;
	} else {
		for (var i = 0; i < currentSprites.length; i++) {
			if (!existingSprites[currentSprites[i].name]
				|| currentSprites[i].lastModified != existingSprites[currentSprites[i].name]["lastModified"]
				|| currentSprites[i].lastModified > spritemapDate) {
				return true;
			}
		}
	}

	return false;
}

// create spritemap according to the last used packing style
SpriteMap.prototype.createSpriteMap = function(filename, cb) {
	var imageFile = path.join("assets", this.name + ".png");
	var dataFile = path.join("assets", this.name + ".json");

	var self = this;

	getLastModifiedDate(imageFile, function(err, spritemapDate) {
		var spritemapNeedsUpdating = false;

		// file does not exist
		if (err) {
			spritemapNeedsUpdating = true;
		// file exists, but check if any of the source images have been motified / sources added/deleted
		} else {
			// TODO: get possible errors from this
			var data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
			spritemapNeedsUpdating = needsUpdating(self.sprites, data, spritemapDate);
		}

		// make the spritemap if it doesn't already exist or is out of date
		if (spritemapNeedsUpdating) {
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
			cb(null, null);
		}

	});
}

module.exports = SpriteMap;
