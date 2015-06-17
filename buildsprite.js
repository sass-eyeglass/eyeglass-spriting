var SpriteMap = require('./SpriteMap');
var ps = require('./PackingStyle');
var path = require('path'); 
var rsvp = require('rsvp'); 

var handleError = function(err) {
	throw err; 
}

var buildSprites = function(folder, packingStyle, spacing) {
	var sm 			 	= new SpriteMap(folder);
	var packingStyle 	= ps.getPackingStyle(packingStyle); 
	var dataFile 		= path.join('spritedata', path.basename(folder) + '_data.json'); 
	var spritemapFile	= path.join('spritemaps', path.basename(folder) + "_spritemap.png");  

	// var promise = new rsvp.Promise(function(resolve, reject) {
	// 	sm.getData(function(err, data) {
	// 		if (err) { console.log(err); reject(err)}
	// 		else 	 resolve(data)
	// 	});
	// });

	// promise.then(function(data) {

	// 	console.log("data received"); 
	// 	// sm.pack(packingStyle, spacing); 

	// 	// sm.saveData(dataFile, function(err, data) {	
	// 	// 	if (err) throw err; 
	// 	// 	console.log('*	wrote sprite data at \'' + dataFile + '\'');
	// 	// }); 

	// 	// sm.createSpriteMap(spritemapFile, function(err, spritemap) { 
	// 	// 	if (err) throw err; 
	// 	// 	console.log('*	created spritemap at \'' + spritemapFile+ '\'');
	// 	// });

	// }, function(err) { console.log(err); })


	// var saveData_promise = sm.saveData(); 
	// var createSpritemap_promise = sm.createSpriteMap(); 

	// saveData_promise.then(function(data) {

	// }, handleError); 

	// createSpritemap_promise.then(function(spritemap) {

	// }, handleError); 

	// get dimensions & hashes; success = sprite data array 
	sm.getData(function(err, data) { 					
		if (err) throw err; 

		// get coordinates 
		sm.pack(packingStyle, spacing);				

		// save json file; success = sprites data in object form 
		sm.saveData(dataFile, function(err, data) {	
			if (err) throw err; 
			console.log('*	wrote sprite data at \'' + dataFile + '\'');
		}); 					

		// create spritemap png; success = spritemap image?
		sm.createSpriteMap(spritemapFile, function(err, spritemap) { 
			if (err) throw err; 
			console.log('*	created spritemap at \'' + spritemapFile+ '\'');
		});		

		
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
