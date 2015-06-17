var SpriteMap = require('./SpriteMap');
var ps = require('./PackingStyle');
var path = require('path'); 

var buildSprites = function(folder, packingStyle) {
	var sm 						= new SpriteMap(folder);
	var packingStyle 	= ps.getPackingStyle(packingStyle); 
	var dataFile 			= path.join('spritedata', path.basename(folder) + '_data.json'); 
	var spritemapFile =	path.join('spritemaps', path.basename(folder) + "_spritemap.png");  

	sm.getData(function() { 							// get dimensions & hashes 
		sm.pack(packingStyle);							// get coordinates 
		sm.saveData(dataFile); 							// save json file 
		sm.createSpriteMap(spritemapFile);	// create spritemap png 
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

if (process.argv.length < 3 || process.argv.length > 4) 
	printUsage(); 
else {
	var packingStyle = "-vl";
	var imagesFolder = process.argv[2];

	// check if packing style specified 
	if (process.argv.length == 4) {
		packingStyle = process.argv[2];
		imagesFolder = process.argv[3]; 
	}

	buildSprites(imagesFolder, packingStyle); 
}
