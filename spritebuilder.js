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

	var spritemapDimensions = [0, 0];
	var spritesData = {}; 

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

	var updateCoordinates = function(cur_coordinates, image, packingStyle) {
		switch (packingStyle) {
			case '-vr' : 
				return [-image.width(), cur_coordinates[1]];
			case '-hb' :
				return [cur_coordinates[0], -image.height()];
			default : 
				return cur_coordinates; 
		}
	}

	var readImageFiles = function(array, index, cur_coordinates) {

		var imageFileRegexp = /\.(gif|jpg|jpeg|png)$/i;

		// read in image files and get sprite map dimensions & sprite data 
		if (index < array.length) {
			lwip.open(array[index], function(err, image) {
				if (err) throw err; 
				else {
					spritemapDimensions = updateSpritemapDimensions(spritemapDimensions, image, packingStyle); 

					var spriteName = getSpriteName(imagesFolder, array[index]);
					var encodingFormat = array[index].match(imageFileRegexp)[1]; 

					image.toBuffer(encodingFormat, function(err, buffer) {
						if (err) throw err; 

						// necessary for right-align or bottom-align 
						cur_coordinates = updateCoordinates(cur_coordinates, image, packingStyle); 

						spritesData[spriteName] = {
							'origin-x'	: cur_coordinates[0],
							'origin-y' 	: cur_coordinates[1],
							'width' 	: image.width(),
							'height' 	: image.height(),
							'filename' 	: array[index],
							'md5sum' 	: crypto.createHash("md5").update(buffer).digest('hex')
						}

						readImageFiles(array, index + 1, getNextCoordinates(cur_coordinates, image, packingStyle)); 
					});
				}
			})

		}

		// finished reading files
		else {

			// right-align or bottom-align sprites 
			updateSpritesData(spritesData, spritemapDimensions, packingStyle); 

			// construct sprite map and paste data in
			// TODO: separate function 
			lwip.create(spritemapDimensions[0], spritemapDimensions[1], function(err, spritemap) {
				if (err) throw err; 
				else {
					var pasteImages = function(array, index, cur_spritemap, cur_ycoord) {
						if (index < array.length) {
							lwip.open(array[index], function(err, image) {
								var spriteName = getSpriteName(imagesFolder, array[index]); 
								var origin_x = spritesData[spriteName]["origin-x"];
								var origin_y = spritesData[spriteName]["origin-y"];
								cur_spritemap.paste(origin_x, origin_y, image, function(err, new_spritemap) {
									pasteImages(array, index + 1, new_spritemap, cur_ycoord + image.height()); 
								});
							}); 
						} else { 
							cur_spritemap.writeFile(spritemapFile, function(err) { 
								if (err) throw err; 
								console.log('*	created spritemap at \'' + spritemapFile + '\'');
							});
						}
					}
					pasteImages(imageFiles, 0, spritemap, 0); 
				}
			});

			// save sprite data to json file 
			// TODO: make helper function 
			fs.writeFile(spritedataFile, JSON.stringify(spritesData, null, 2), function(err) {
			    if(err) throw err; 
			    console.log('*	wrote sprite data at \'' + spritedataFile + '\'');
			}); 
		} 
	}
	
	readImageFiles(imageFiles, 0, [0, 0]);
}

if (process.argv.length < 3 || process.argv.length > 4) 
	console.log("\nusage:	node spritebuilder.js [path-to-image-folder]\n"
	+ "or	node spritebuilder.js [packing-style] [path-to-image-folder]\n\n"
	+ "packing style options:\n"
	+ "	-vl : vertical left-aligned\n"
	+ "	-vr : vertical right-aligned\n"
	+ "	-ht : horizontal top-aligned\n"
	+ "	-hb : horizontal bottom-aligned\n"
	+ "	-d  : diagonal\n");
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



// ===

	// // get image files 
	// for (var i = 0; i < filenames.length; i++) {
	// 	if (imageFileRegexp.test(filenames[i])) {
	// 		imageFiles.push(filenames[i]);
	// 	}
	// }

	// // map filename -> object with width, height, buffer 
	// var images = new Map();

	// for (var i = 0; i < imageFiles.length; i++) {
	// 	console.log(imageFiles[i]); 
	// 	images.set(imageFiles[i], 'test');
	// 	// lwip.open(imagesFolder + imageFiles[i], function(err, image) {
	// 	// 	if (err) console.log(err); 
	// 	// 	// image.toBuffer('png', function(err, buffer) {
	// 	// 	// 	console.log(imageFiles[i]);
	// 	// 	// 	images.set(imageFiles[i], {
	// 	// 	// 		'width' : image.width(), 
	// 	// 	// 		'height' : image.height(), 
	// 	// 	// 		'data' : buffer
	// 	// 	// 	});
	// 	// 	// });
			
	// 	// }); 
	// }

	// // while(images.size < imageFiles.length) {}
	// console.log(images); 

	// // go through each image file 
	// for (var i = 0; i < filenames.length; i++) {
	// 	if (imageFileRegexp.test(filenames[i])) {
	// 		// imageFiles.push(filenames[i]);
	// 		lwip.open(imagesFolder + filenames[i], function(err, new_image) {
	// 			if (err) console.log("error opening image " + imagesFolder + filenames[i]); 
	// 			else {

	// 				lwip.open(spritemapFile, function(err, old_spritemap) {
	// 					var spritemap_width = Math.max(new_image.width(), old_spritemap.width()); 
	// 					var spritemap_height = old_spritemap.height() + new_image.height(); 

	// 					// console.log(old_spritemap.width(), old_spritemap.height(), " | ", spritemap_width, spritemap_height); 
	// 					old_spritemap.crop(0, 0, spritemap_width, spritemap_height, function(err, resized_spritemap) {
	// 						resized_spritemap.paste(0, spritemap_height - new_image.height(), new_image, function(err, new_spritemap) {
	// 							new_spritemap.writeFile(spritemapFile, function(err) { if (err) console.log("error saving spritemap") });
	// 						})
							
	// 					})
	// 				})

	// 			}
	// 		})
	// 	}
	// }

	// ---

	// // create spritemap 
	// lwip.create(1, 1, function(err, spritemap) {
	// 	// go through each image file 
	// 	for (var i = 0; i < filenames.length; i++) {
	// 		if (imageFileRegexp.test(filenames[i])) {
	// 			lwip.open(imagesFolder + filenames[i], function(err, newImage) {
	// 				// resize spritemap 
	// 				spritemap_width = newImage.width() > spritemap.width() ? newImage.width() : spritemap.width(); 
	// 				spritemap_height += newImage.height(); 
	// 				spritemap.crop(0, 0, spritemap_width, spritemap_height, function(err, newSpritemap) {
	// 					// image.writeFile('output.jpg', function(err){ });
	// 					// // paste new image onto spritemap 
	// 					newSpritemap.paste(0, spritemap_height - newImage.height(), newImage, function(err, img) {
	// 						img.writeFile('output.jpg', function(err){ });
	// 					});
	// 				}); 
					


	// 			}); 
				
	// 		}
	// 	}

	// });

	// console.log(spritemap_width, spritemap_height); 
	// console.log(imageFiles); 

	// lwip.create(spritemap_width, spritemap_height, function(err, spritemap) {

		// top = 0; 

		// // copy each image onto the sprite map 
		// for (var i = 0; i < imageFiles.length; i++) {
		// 	lwip.open(imageFiles[i], function(err, image) {

		// 		spritemap.paste(0, top, image, function(err, img) { });
		// 		top += image.height(); 

		// 	})
		// }

		// spritemap.writeFile('spritemap.jpg', function(err) {
		// 	if (err) console.log(err); 
		// })

	// })

	// console.log(imageFiles); 