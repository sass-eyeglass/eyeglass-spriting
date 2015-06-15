/* 
 * Each packing style object should contain the following methods:
 * 
 * updateSpritemapDimensions - called on each image in getSpritesData 
 * getNextCoordinates - called on each image to get sprite top left coordinates
 * updateSpritesData - called at the end of getSpritesData to right-align 
 *					   or bottom-align sprites
 */ 

var fakePrevImage = {
	height : function() { return 0 }, 
	width  : function() { return 0 }
}


var vertical_left = {
	updateSpritemapDimensions : function(curDimensions, image) {
		return [Math.max(curDimensions[0], image.width()), curDimensions[1] + image.height()];
	}, 
	getNextCoordinates : function(prevCoordinates, prevImage, curImage) {
		if (!prevImage) prevImage = fakePrevImage; 
		return [0, prevCoordinates[1] + prevImage.height()];
	},
	updateSpritesData : function(sprites_data, spritemap_dimensions) {
		return; 
	}
}


var vertical_right = {
	updateSpritemapDimensions : function(curDimensions, image) {
		return [Math.max(curDimensions[0], image.width()), curDimensions[1] + image.height()];
	}, 
	getNextCoordinates : function(prevCoordinates, prevImage, curImage) {
		if (!prevImage) prevImage = fakePrevImage; 
		return [-curImage.width(), prevCoordinates[1] + prevImage.height()];
	},
	updateSpritesData : function(sprites_data, spritemap_dimensions) {
		for (sprite in sprites_data)
			sprites_data[sprite]["origin-x"] += spritemap_dimensions[0]; 
	}
}


var horizontal_top = {
	updateSpritemapDimensions : function(curDimensions, image) {
		return [curDimensions[0] + image.width(), Math.max(curDimensions[1], image.height())]; 
	}, 
	getNextCoordinates : function(prevCoordinates, prevImage, curImage) {
		if (!prevImage) prevImage = fakePrevImage; 
		return [prevCoordinates[0] + prevImage.width(), 0];
	},
	updateSpritesData : function(sprites_data, spritemap_dimensions) {
		return; 
	}
}


var horizontal_bottom = {
	updateSpritemapDimensions : function(curDimensions, image) {
		return [curDimensions[0] + image.width(), Math.max(curDimensions[1], image.height())]; 
	}, 
	getNextCoordinates : function(prevCoordinates, prevImage, curImage) {
		if (!prevImage) prevImage = fakePrevImage; 
		return [prevCoordinates[0] + prevImage.width(), -curImage.height()]; 
	},
	updateSpritesData : function(sprites_data, spritemap_dimensions) {
		for (sprite in sprites_data)
			sprites_data[sprite]["origin-y"] += spritemap_dimensions[1];
	}
}


var diagonal = {
	updateSpritemapDimensions : function(curDimensions, image) {
		return [curDimensions[0] + image.width(), curDimensions[1] + image.height()]; 
	}, 
	getNextCoordinates : function(prevCoordinates, prevImage, curImage) {
		if (!prevImage) prevImage = fakePrevImage; 
		return [prevCoordinates[0] + prevImage.width(), prevCoordinates[1] + prevImage.height()]; 
	},
	updateSpritesData : function(sprites_data, spritemap_dimensions) {
		return; 
	}
}


module.exports.getPackingStyle = function(str) {
	switch (str) {
		case '-vl' : 
			return vertical_left;
		case '-ht' : 
			return horizontal_top; 
		case '-vr' :
			return vertical_right; 
		case '-hb' : 
			return horizontal_bottom; 
		case '-d'  :
			return diagonal;
		default : // do vertical left-aligned packing by default 
			return vertical_left;
	}
}
