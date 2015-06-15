/* 
 * Each packing style object should contain the following methods; 
 * 
 * updateSpritemapDimensions - called on each image in getSpritesData 
 * getNextCoordinates - called on each image to get coordinates of next sprite
 * updateCoordinates - 
 * updateSpritesData - called at the end of getSpritesData to right-align 
 *					   or bottom-align sprites
 */ 

var vertical_left = {
	// called on each image in getSpritesData 
	updateSpritemapDimensions : function(curDimensions, image) {
	}, 
	// called on each image to get coordinates of next sprite
	getNextCoordinates : function(cur_coordinates, image) {
	},
	updateCoordinates : function(cur_coordinates, image) {
	},
	updateSpritesData : function(sprites_data, spritemap_dimensions) {
	}
}


var vertical_right = {

}


var horizontal_top = {

}


var horizontal_bottom = {

}


var diagonal = {

}


module.exports.getPackingStyle = function(str) {
	switch (packingStyle) {
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
