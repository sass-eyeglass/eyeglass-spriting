var lwip = require("lwip"); 
var fs = require("fs"); 
var path = require("path"); 
var crypto = require("crypto");
var walk = require("walk"); 
var ps = require('./packingstyles');

var defaultPacking = '-vl';

// recursively get all the image files in given folder; returns array of filenames 
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

var buildSpriteMap = function(imagesFolder, packingStyle) {
	
	var files = []; 
	getAllImageFiles(imagesFolder, function(imgFiles) {
		files = imgFiles; 
	}); 
	
	// console.log("image files:", files); 

var imageFileRegexp = /\.(gif|jpg|jpeg|png)$/i;

	var prefix = path.basename(imagesFolder); 
	var spritemapFile = path.join("spritemaps", prefix + "_spritemap.png"); 
	var spritedataFile = path.join("spritedata", prefix + "_spritedata.json"); 

	try {
		var filenames = fs.readdirSync(imagesFolder);
	} catch (err) {
		console.log("directory not found!");
		return; 
	}

	
	var imageFiles = []; 

	var spritemap_dimensions = [0, 0];
	var sprites_data = {}; 

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

		// read in image files and get sprite map dimensions & sprite data 
		if (index < array.length) {
			
			// image file found 
			// TODO: do image file checking outside; use glob 
			if (imageFileRegexp.test(filenames[index])) {
				imageFiles.push(filenames[index]);
				lwip.open(path.join(imagesFolder, array[index]), function(err, image) {
					if (err) throw err; 
					else {
						spritemap_dimensions = updateSpritemapDimensions(spritemap_dimensions, image, packingStyle); 

						var sprite_name = imagesFolder + "-" + filenames[index].substring(0, filenames[index].indexOf('.'));

						var encodingFormat = filenames[index].match(imageFileRegexp)[1]; 
						image.toBuffer(encodingFormat, function(err, buffer) {
							if (err) throw err; 

							// necessary for right-align or bottom-align 
							cur_coordinates = updateCoordinates(cur_coordinates, image, packingStyle); 

							sprites_data[sprite_name] = {
								'origin-x'	: cur_coordinates[0],
								'origin-y' 	: cur_coordinates[1],
								'width' 	: image.width(),
								'height' 	: image.height(),
								'filename' 	: filenames[index],
								'md5sum' 	: crypto.createHash("md5").update(buffer).digest('hex')
							}

							readImageFiles(array, index + 1, getNextCoordinates(cur_coordinates, image, packingStyle)); 
						});
					}
				})
			} else {
				readImageFiles(array, index + 1, cur_coordinates); 
			}
		}

		// finished reading files
		else if (imageFiles.length > 0) {

			// right-align or bottom-align sprites 
			updateSpritesData(sprites_data, spritemap_dimensions, packingStyle); 

			// construct sprite map and paste data in
			// TODO: separate function 
			lwip.create(spritemap_dimensions[0], spritemap_dimensions[1], function(err, spritemap) {
				if (err) throw err; 
				else {
					var pasteImages = function(array, index, cur_spritemap, cur_ycoord) {
						if (index < array.length) {
							lwip.open(path.join(imagesFolder, array[index]), function(err, image) {
								var sprite_name = imagesFolder + "-" + array[index].substring(0, array[index].indexOf('.'));
								var origin_x = sprites_data[sprite_name]["origin-x"];
								var origin_y = sprites_data[sprite_name]["origin-y"];
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
			fs.writeFile(spritedataFile, JSON.stringify(sprites_data, null, 2), function(err) {
			    if(err) throw err; 
			    console.log('*	wrote sprite data at \'' + spritedataFile + '\'');
			}); 
		} 

		else console.log('no images found in \'' + imagesFolder + '\' folder');
	}

	readImageFiles(filenames, 0, [0, 0]);

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

	buildSpriteMap(imagesFolder, packingStyle); 
}

module.exports = buildSpriteMap; 



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