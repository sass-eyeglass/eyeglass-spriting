var ps 			= require('./PackingStyle');
var glob 		= require('glob'); 
var fs 			= require('fs'); 
var path 		= require('path'); 
var lwip 		= require('lwip'); 
var crypto	= require('crypto'); 

// TODO: move these to a util file?

var getAllImageFiles = function(folder) {
	return glob.sync(path.join(folder, "**/*.+(png|jpg|jpeg|gif)")); 
}

var getSpriteName = function(imagesFolder, filePath) {
	var prefix = path.basename(imagesFolder); 
	var filename = path.basename(filePath); 
	return prefix + "-" + filename.substring(0, filename.indexOf('.'));
}

function SpriteMap(imagesFolder) {
	this.sprites 		= []; 
	this.filenames	= getAllImageFiles(imagesFolder); 
	this.width 			= null; 
	this.height 		= null; 

	for (var i = 0; i < this.filenames.length; i++) {
		this.sprites[i] = { 
			'name'     : getSpriteName(imagesFolder, this.filenames[i]),
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
				if (err) throw err; 

				var encodingFormat = array[index].filename.match(imageFileRegexp)[1]; 
				image.toBuffer(encodingFormat, function(err, buffer) {
					if (err) throw err; 

					array[index].width 	= image.width();
					array[index].height = image.height(); 
					array[index].md5sum = crypto.createHash("md5").update(buffer).digest('hex');

					aux(array, index + 1); 
				}); 
			});
		} else {
			cb(array); 
		}
	}

	aux(this.sprites, 0); 
}

// get coordinates for each sprite & spritemap dimensions 
SpriteMap.prototype.pack = function(packingStyle) {
	var dimensions = packingStyle.pack(this.sprites); 
	this.width 	= dimensions[0]; 
	this.height	= dimensions[1]; 
}

// save sprites data to file in json format 
SpriteMap.prototype.saveData = function(filename) {
	var data = {}; 
	for (var i = 0; i < this.sprites.length; i++) {
		data[this.sprites[i].name] = this.sprites[i]; 
	}

	fs.writeFile(filename, JSON.stringify(data, null, 2), function(err) {
		if(err) throw err; 
		// console.log('*	wrote sprite data at \'' + filename + '\'');
	}); 
}

// create spritemap according to the last used packing style 
SpriteMap.prototype.createSpriteMap = function(filename) {
	var self = this;

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
				if (err) throw err; 
				// console.log('*	created spritemap at \'' + filename + '\'');
			});
		}
	}

	lwip.create(this.width, this.height, function(err, spritemap) {
		if (err) throw err; 
		pasteImages(0, spritemap); 
	});
}

module.exports = SpriteMap; 
