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

	this.imagesFolder	= imagesFolder; 
	this.filenames	 	= getAllImageFiles(imagesFolder); 
	this.sprites 			= []; 
	this.hasData 			= false; 
	this.packingStyle = null; 
	this.width 				= null; 
	this.height 			= null; 

	for (var i = 0; i < this.filenames.length; i++) {
		this.sprites[i] = { 
			'name'     : getSpriteName(this.imagesFolder, this.filenames[i]),
			'filename' : this.filenames[i] 
		};
	}

	// get width, height, md5sums 
	this.getData = function() {
  
		var imageFileRegexp = /\.(gif|jpg|jpeg|png)$/i;

		var aux = function(array, index) {
			if (index < array.length) {
				lwip.open(array[index].filename, function(err, image) {
					if (err) throw err; 

					var encodingFormat = array[index].filename.match(imageFileRegexp)[1]; 

					image.toBuffer(encodingFormat, function(err, buffer) {
						if (err) throw err; 
						array[index] = {
							'name' : array[index].name,
							'filename' : array[index].filename, 
							'width' : image.width(),
							'height' : image.height(),
							'md5sum' : crypto.createHash("md5").update(buffer).digest('hex')
						}
						aux(array, index + 1); 
					}); 
				});
			} else {
				this.hasData = true; 
			}
		}

		aux(this.sprites, 0); 
	}

	// get coordinates for each sprite 
	this.pack = function(packingStyle) {
		if (!this.hasData) console.log("must call getData() first!");
		else {
			this.packingStyle = packingStyle; 
		}
	}

	this.saveData = function(filename) {
		// if (!this.hasData || !this.packingStyle) console.log("must call getData() and pack() first!");
		
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

	}



}

var buildSprites = function(folder, packingStyle) {

	var sm = new SpriteMap(folder);
	sm.getData(); 
	// sm.pack(); 
	sm.saveData("data.json"); 
	// sm.createSpriteMap("spritemap.png"); 

}

buildSprites("images/corgi", "-vl"); 

module.exports = SpriteMap; 