// var Layout 	= require('./Layout');
var glob 		= require('glob');
var fs 			= require('fs');
var path 		= require('path');
var lwip 		= require('lwip');
var crypto	= require('crypto');

var getSpriteName = function(imagesFolder, filePath) {
	var prefix = path.basename(imagesFolder);
	var filename = path.basename(filePath);
	return prefix + "-" + filename.substring(0, filename.indexOf('.'));
}

// imagePaths = array of images and/or folders containing images
function SpriteMap(name, imagePaths, sources) {
	this.name = name;
	this.sprites = [];
	// this.filenames = [];
	this.filenames = imagePaths;
	this.width = 0;
	this.height = 0;

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
		throw new Error("no images found in \'" + imagesFolder + "\' folder!");

	for (var i = 0; i < this.filenames.length; i++) {
		this.sprites[i] = {
			// TODO: decide how to name sprites?
			// 'name'     : getSpriteName(imagesFolder, this.filenames[i]),
			'name' : sources[i],
			'filename' : this.filenames[i]
		};
	}
}

// get dimensions & hashes
SpriteMap.prototype.getData = function(cb) {
	var imageFileRegexp = /\.(gif|jpg|jpeg|png)$/i;

	var aux = function(array, index) {
		if (index < array.length) {
			lwip.open(array[index].filename, function(err, image) {
				if (err) cb(err, null);

				var encodingFormat = array[index].filename.match(imageFileRegexp)[1];
				image.toBuffer(encodingFormat, function(err, buffer) {
					if (err) cb(err, null);

					array[index].width 	= image.width();
					array[index].height = image.height();
					array[index].md5sum = crypto.createHash("md5").update(buffer).digest('hex');

					aux(array, index + 1);
				});
			});
		} else {
			cb(null, array);
		}
	}

	aux(this.sprites, 0);
}

// get coordinates for each sprite & spritemap dimensions
SpriteMap.prototype.pack = function(layoutStyle) {
	var dimensions = layoutStyle.pack(this.sprites);
	this.width 	= dimensions[0];
	this.height	= dimensions[1];
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

// create spritemap according to the last used packing style
SpriteMap.prototype.createSpriteMap = function(filename, cb) {
	var self = this;

	if (!filename) {
		filename = this.name + ".png";
	}

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
				else 		 cb(null, cur_spritemap);
			});
		}
	}

	lwip.create(this.width, this.height, function(err, spritemap) {
		if (err) cb(err, null);
		pasteImages(0, spritemap);
	});
}

module.exports = SpriteMap;
