var lwip = require("lwip"); 
var fs = require("fs"); 
var path = require("path"); 
var crypto = require("crypto");
var walk = require("walk"); 
var ps = require('./packingstyles');

var defaultPacking = '-vl';

// recursively get all the image files in given folder; returns array of filenames 
// TODO: use glob?
var getAllImageFiles = function(folder, cb) {
	var imageFileRegexp = /\.(gif|jpg|jpeg|png)$/i;
	var imageFiles = []; 	

	var options = {
		listeners : {
			file : function(root, stats, next) {
				if (imageFileRegexp.test(stats.name)) {
					imageFiles.push(path.join(root, stats.name)); 
				}
				next(); 
			}, 
			end : function() {
				cb(imageFiles); 
			}
		}
	};

	var walker = walk.walkSync(folder, options);
}

var getSpriteName = function(imagesFolder, filePath) {
	var prefix = path.basename(imagesFolder); 
	var filename = path.basename(filePath); 
	return prefix + "-" + filename.substring(0, filename.indexOf('.'));
}

// return array [newWidth, newHeight]
var updateSpritemapDimensions = function(curDimensions, image, packingStyle) {
	switch (packingStyle) {
		case '-vl' : 
			return [Math.max(curDimensions[0], image.width()), curDimensions[1] + image.height()];
		case '-ht' : 
			return [curDimensions[0] + image.width(), Math.max(curDimensions[1], image.height())]; 
		case '-vr' :
			return [Math.max(curDimensions[0], image.width()), curDimensions[1] + image.height()];
		case '-hb' : 
			return [curDimensions[0] + image.width(), Math.max(curDimensions[1], image.height())]; 
		case '-d'  : 
			return [curDimensions[0] + image.width(), curDimensions[1] + image.height()]; 
		default : // do vertical left-aligned packing by default 
			return [Math.max(curDimensions[0], image.width()), curDimensions[1] + image.height()];
	}
}

// return array [newX, newY]
var getNextCoordinates = function(cur_coordinates, image, packingStyle) {
	switch (packingStyle) {
		case '-vl' : 
			return [0, cur_coordinates[1] + image.height()];
		case '-ht' : 
			return [cur_coordinates[0] + image.width(), 0];
		case '-vr' :
			return [-image.width(), cur_coordinates[1] + image.height()];
		case '-hb' : 
			return [cur_coordinates[0] + image.width(), -image.height()]; 
		case '-d'  :
			return [cur_coordinates[0] + image.width(), cur_coordinates[1] + image.height()]; 
		default : // do vertical left-aligned packing by default 
			return [0, cur_coordinates[1] + image.height()];
	}
}

var getNextCoordinates = function(prevCoordinates, prevImage, curImage, packingStyle) {
	switch (packingStyle) {
		case '-vl' : 
			return [0, prevCoordinates[1] + prevImage.height()];
		case '-ht' : 
			return [prevCoordinates[0] + prevImage.width(), 0];
		case '-vr' :
			return [-curImage.width(), prevCoordinates[1] + prevImage.height()];
		case '-hb' : 
			return [prevCoordinates[0] + prevImage.width(), -curImage.height()]; 
		case '-d'  :
			return [prevCoordinates[0] + prevImage.width(), prevCoordinates[1] + prevImage.height()]; 
		default : // do vertical left-aligned packing by default 
			return [0, prevCoordinates[1] + prevImage.height()];
	}
}

var updateSpritesData = function(sprites_data, spritemap_dimensions, packingStyle) {
	switch (packingStyle) {
		case '-vr' : 
			for (sprite in sprites_data)
				sprites_data[sprite]["origin-x"] += spritemap_dimensions[0]; 
			break; 
		case '-hb' :
			for (sprite in sprites_data)
				sprites_data[sprite]["origin-y"] += spritemap_dimensions[1];
			break; 
		default : 
			break; 
	}
}

// var updateCoordinates = function(cur_coordinates, image, packingStyle) {
// 	switch (packingStyle) {
// 		case '-vr' : 
// 			return [-image.width(), cur_coordinates[1]];
// 		case '-hb' :
// 			return [cur_coordinates[0], -image.height()];
// 		default : 
// 			return cur_coordinates; 
// 	}
// }

var createSpriteMap = function(dimensions, imageFiles, spritesData, filename) {
	lwip.create(dimensions[0], dimensions[1], function(err, spritemap) {
		if (err) throw err; 
		
		var pasteImages = function(array, index, cur_spritemap) {
			if (index < array.length) {
				lwip.open(array[index], function(err, image) {
					var spriteName = getSpriteName(imagesFolder, array[index]); 
					var origin_x = spritesData[spriteName]["origin-x"];
					var origin_y = spritesData[spriteName]["origin-y"];
					cur_spritemap.paste(origin_x, origin_y, image, function(err, new_spritemap) {
						pasteImages(array, index + 1, new_spritemap); 
					});
				}); 
			} else { 
				cur_spritemap.writeFile(filename, function(err) { 
					if (err) throw err; 
					console.log('*	created spritemap at \'' + filename + '\'');
				});
			}
		}
		
		pasteImages(imageFiles, 0, spritemap); 
	});
}

var saveSpriteData = function(spritesData, filename) {
	fs.writeFile(filename, JSON.stringify(spritesData, null, 2), function(err) {
		if(err) throw err; 
		console.log('*	wrote sprite data at \'' + filename + '\'');
	}); 
}

var printUsage = function() {
	console.log("\nusage:	node spritebuilder.js [path-to-image-folder]\n"
		+ "or	node spritebuilder.js [packing-style] [path-to-image-folder]\n\n"
		+ "packing style options:\n"
		+ "	-vl : vertical left-aligned\n"
		+ "	-vr : vertical right-aligned\n"
		+ "	-ht : horizontal top-aligned\n"
		+ "	-hb : horizontal bottom-aligned\n"
		+ "	-d  : diagonal\n");
}

var buildSprites = function(imagesFolder, packingStyle) {
	
	var imageFiles = []; 
	getAllImageFiles(imagesFolder, function(result) {
		imageFiles = result; 
	}); 

	if (imageFiles.length <= 0) {
		console.log('no images found in \'' + imagesFolder + '\' folder');
		return; 
	}

	var spritemapFile = path.join("spritemaps", path.basename(imagesFolder) + "_spritemap.png"); 
	var spritedataFile = path.join("spritedata", path.basename(imagesFolder) + "_spritedata.json"); 

	// var spritemapDimensions = [0, 0];
	var spritesData = {}; 

	var getSpritesData = function(array, index, prevImage, prevCoordinates, spritemapDimensions) {

		var imageFileRegexp = /\.(gif|jpg|jpeg|png)$/i;

		// read in image files and get sprite map dimensions & sprite data 
		if (index < array.length) {
			lwip.open(array[index], function(err, image) {
				if (err) throw err; 

				spritemapDimensions = updateSpritemapDimensions(spritemapDimensions, image, packingStyle); 
				var curCoordinates = getNextCoordinates(prevCoordinates, prevImage, image, packingStyle); 

				var spriteName = getSpriteName(imagesFolder, array[index]);
				var encodingFormat = array[index].match(imageFileRegexp)[1]; 

				image.toBuffer(encodingFormat, function(err, buffer) {
					if (err) throw err; 

					// necessary for right-align or bottom-align 
					// curCoordinates = updateCoordinates(curCoordinates, image, packingStyle); 

					spritesData[spriteName] = {
						'origin-x'	: curCoordinates[0],
						'origin-y' 	: curCoordinates[1],
						'width' 	: image.width(),
						'height' 	: image.height(),
						'filename' 	: array[index],
						'md5sum' 	: crypto.createHash("md5").update(buffer).digest('hex')
					}

					getSpritesData(array, index + 1, image, curCoordinates, spritemapDimensions); 
				});
			});
		}

		// finished reading files
		else {
			// cb(spritesData, spritemapDimensions); 
			// right-align or bottom-align sprites 
			updateSpritesData(spritesData, spritemapDimensions, packingStyle); 
			createSpriteMap(spritemapDimensions, imageFiles, spritesData, spritemapFile);
			saveSpriteData(spritesData, spritedataFile); 
		} 
	}
	
	getSpritesData(imageFiles, 0, [0, 0], [0, 0], function(spritesData, spritemapDimensions) {
		updateSpritesData(spritesData, spritemapDimensions, packingStyle); 
		createSpriteMap(spritemapDimensions, imageFiles, spritesData, spritemapFile);
		saveSpriteData(spritesData, spritedataFile); 
	});
}



if (process.argv.length < 3 || process.argv.length > 4) 
	printUsage(); 
else {
	var packingStyle = defaultPacking;
	var imagesFolder = process.argv[2];

	// check if packing style specified 
	if (process.argv.length == 4) {
		packingStyle = process.argv[2];
		imagesFolder = process.argv[3]; 
	}

	buildSprites(imagesFolder, packingStyle); 
}

module.exports = buildSprites;