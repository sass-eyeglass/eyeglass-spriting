var SpriteMap = require('./SpriteMap');
var l = require('./Layout');
var path = require('path');
var rsvp = require('rsvp');

var handleError = function(err) {
	throw err;
}

var buildSprites = function(folder, layoutStyle, options) {
	var sm = new SpriteMap("buildsprite", [folder]);
	var layoutStyle = l.getLayoutStyle(layoutStyle, options);
	var dataFile = path.join('spritedata', path.basename(folder) + '_data.json');
	var spritemapFile = path.join('spritemaps', path.basename(folder) + "_spritemap.png");

	// get dimensions & hashes; success = sprite data array
	sm.getData(function(err, data) {
		if (err) throw err;

		// get coordinates
		sm.pack(layoutStyle, spacing);

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
	// console.log("\nusage:	node buildsprite.js [path-to-image-folder]\n"
	// 	+ "	node buildsprite.js [packing-style] [path-to-image-folder]\n"
	// 	+ "	node buildsprite.js [packing-style] [spacing] [path-to-image-folder]\n\n"
	// 	+ "packing style options:\n"
	// 	+ "	-vl : vertical left-aligned\n"
	// 	+ "	-vr : vertical right-aligned\n"
	// 	+ "	-ht : horizontal top-aligned\n"
	// 	+ "	-hb : horizontal bottom-aligned\n"
	// 	+ "	-d  : diagonal\n");
	console.log("usage:	node buildsprite.js [layout] [alignment] [spacing] [path-to-images-folder]");
}

if (process.argv.length < 6) printUsage();
else {
	var layout = process.argv[2];
	var alignment = process.argv[3];
	var spacing = parseInt(process.argv[4]);
	var imagesFolder = process.argv[5];

	var options = {
		alignment : alignment,
		spacing : spacing
	}

	buildSprites(imagesFolder, layout, options);
}

// if (process.argv.length < 3 || process.argv.length > 5)
// 	printUsage();
// else {
// 	var layoutStyle = "-vl";
// 	var imagesFolder = process.argv[2];
// 	var spacing = 0;

// 	// check if packing style specified
// 	if (process.argv.length == 4) {
// 		layoutStyle = process.argv[2];
// 		imagesFolder = process.argv[3];
// 	} else if (process.argv.length == 5) {
// 		layoutStyle = process.argv[2];
// 		spacing = parseInt(process.argv[3]);
// 		imagesFolder = process.argv[4];
// 	}

// 	buildSprites(imagesFolder, layoutStyle, spacing);
// }
