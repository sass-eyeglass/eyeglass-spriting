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

	this.sprites 			= []; 
	this.imagesFolder	= imagesFolder; 
	this.filenames	 	= getAllImageFiles(imagesFolder); 
	var test = []; 

	// this.hasData 			= false; 
	// this.packingStyle = null; 
	this.width 				= null; 
	this.height 			= null; 

	for (var i = 0; i < this.filenames.length; i++) {
		this.sprites[i] = { 
			'name'     : getSpriteName(this.imagesFolder, this.filenames[i]),
			'filename' : this.filenames[i] 
		};
	}

	// get dimensions & hashes 
	this.getData = function(cb) {
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

	// get coordinates for each sprite 
	this.pack = function(packingStyle) {
		var coordinates = packingStyle.getAllCoordinates(this.sprites); 
		var dimensions 	= packingStyle.getSpritemapDimensions(this.sprites); 

		this.width 	= dimensions[0]; 
		this.height = dimensions[1]; 

		for (var i = 0; i < this.sprites.length; i++) {
			this.sprites[i].origin_x = coordinates[i][0]; 
			this.sprites[i].origin_y = coordinates[i][1];
		}
	}

	this.saveData = function(filename) {
		var data = {}; 
		for (var i = 0; i < this.sprites.length; i++) {
			data[this.sprites[i].name] = this.sprites[i]; 
		}

		fs.writeFile(filename, JSON.stringify(data, null, 2), function(err) {
			if(err) throw err; 
			console.log('*	wrote sprite data at \'' + filename + '\'');
		}); 
	}

	this.createSpriteMap = function(filename) {

	// 	var pasteImages = function(index, cur_spritemap) {
	// 		if (index < this.sprites.length) {
	// 			lwip.open(this.sprites[index].filename, function(err, image) {
	// 				var origin_x = this.sprites[index].origin_x;
	// 				var origin_y = this.sprites[index].origin_y; 
	// 				cur_spritemap.paste(origin_x, origin_y, image, function(err, new_spritemap) {
	// 					pasteImages(index + 1, new_spritemap); 
	// 				});
	// 			}); 
	// 		} else { 
	// 			cur_spritemap.writeFile(filename, function(err) { 
	// 				if (err) throw err; 
	// 				console.log('*	created spritemap at \'' + filename + '\'');
	// 			});
	// 		}
	// 	}

	// 	lwip.create(this.width, this.height, function(err, spritemap) {
	// 		if (err) throw err; 
	// 		pasteImages(0, spritemap); 
	// 	});
	// }

}

var buildSprites = function(folder, packingStyle) {

	// var sm = new SpriteMap(folder);
	// sm.getData();															// get dimensions & hashes 
	// sm.pack(ps.getPackingStyle(packingStyle));	// get coordinates 
	// sm.saveData("data.json"); 									// save json file 
	// sm.createSpriteMap("spritemap.png"); 			// create spritemap png 

	var sm = new SpriteMap(folder);
	var packingStyle = ps.getPackingStyle(packingStyle); 

	sm.getData(function(data) { 						// get dimensions & hashes 
		sm.pack(packingStyle);								// get coordinates 
		sm.saveData("data.json"); 						// save json file 
		sm.createSpriteMap("spritemap.png"); 	// create spritemap png 
	});																

}

buildSprites("images/corgi", "-vl"); 

module.exports = SpriteMap; 
