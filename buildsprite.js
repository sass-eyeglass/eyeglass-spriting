var SpriteMap = require('./SpriteMap');
var ps = require('./PackingStyle');
var path = require('path'); 

var buildSprites = function(folder, packingStyle, spacing) {
	var sm 			 	= new SpriteMap(folder);
	var packingStyle 	= ps.getPackingStyle(packingStyle); 
	var dataFile 		= path.join('spritedata', path.basename(folder) + '_data.json'); 
	var spritemapFile	= path.join('spritemaps', path.basename(folder) + "_spritemap.png");  

	sm.getData(function() { 					// get dimensions & hashes 
		sm.pack(packingStyle, spacing);				// get coordinates 

		sm.saveData(dataFile); 					// save json file 
		console.log('*	wrote sprite data at \'' + dataFile + '\'');

		sm.createSpriteMap(spritemapFile);		// create spritemap png 
		console.log('*	created spritemap at \'' + spritemapFile+ '\'');
	});																
}

var printUsage = function() {
	console.log("\nusage:	node buildsprite.js [path-to-image-folder]\n"
		+ "	node buildsprite.js [packing-style] [path-to-image-folder]\n"
		+ "	node buildsprite.js [packing-style] [spacing] [path-to-image-folder]\n\n"
		+ "packing style options:\n"
		+ "	-vl : vertical left-aligned\n"
		+ "	-vr : vertical right-aligned\n"
		+ "	-ht : horizontal top-aligned\n"
		+ "	-hb : horizontal bottom-aligned\n"
		+ "	-d  : diagonal\n");
}

if (process.argv.length < 3 || process.argv.length > 5) 
	printUsage(); 
else {
	var packingStyle = "-vl";
	var imagesFolder = process.argv[2];
	var spacing = 0; 

	// check if packing style specified 
	if (process.argv.length == 4) {
		packingStyle = process.argv[2];
		imagesFolder = process.argv[3]; 
	} else if (process.argv.length == 5) {
		packingStyle = process.argv[2]; 
		spacing = parseInt(process.argv[3]); 
		imagesFolder = process.argv[4]; 
	}

	buildSprites(imagesFolder, packingStyle, spacing); 
}
