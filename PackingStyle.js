
/* The pack function modifies the sprites array passed in and adds coordinates to each 
 * element. It also calculates the spritemap width and height, and returns them in an array. 
 */

var vertical_left = {
	pack : function(sprites) {
		var width 	= sprites[0].width; 
		var height 	= sprites[0].height; 
		sprites[0].origin_x = 0; 
		sprites[0].origin_y = 0; 

		for (var i = 1; i < sprites.length; i++) {
			sprites[i].origin_x = 0; 
			sprites[i].origin_y = sprites[i-1].origin_y + sprites[i-1].height; 

			width 	= Math.max(width, sprites[i].width); 
			height += sprites[i].height; 
		}

		return [width, height]; 
	}
}


var vertical_right = {
	pack : function(sprites) {
		var width 	= sprites[0].width; 
		var height 	= sprites[0].height; 
		sprites[0].origin_x = -sprites[0].width; 
		sprites[0].origin_y = 0;

		for (var i = 1; i < sprites.length; i++) {
			sprites[i].origin_x = -sprites[i].width; 
			sprites[i].origin_y = sprites[i-1].origin_y + sprites[i-1].height; 

			width 	= Math.max(width, sprites[i].width); 
			height += sprites[i].height; 
		}

		for (var i = 0; i < sprites.length; i++) 
			sprites[i].origin_x += width; 

		return [width, height]; 
	}
}


var horizontal_top = {
	pack : function(sprites) {
		var width 	= sprites[0].width; 
		var height 	= sprites[0].height; 
		sprites[0].origin_x = 0; 
		sprites[0].origin_y = 0; 

		for (var i = 1; i < sprites.length; i++) {
			sprites[i].origin_x = sprites[i-1].origin_x + sprites[i-1].width; 
			sprites[i].origin_y = 0; 

			width += sprites[i].width; Math.max(width, sprites[i].width); 
			height = Math.max(height, sprites[i].height); 
		}

		return [width, height]; 
	}
}


var horizontal_bottom = {
	pack : function(sprites) {
		var width 	= sprites[0].width; 
		var height 	= sprites[0].height; 
		sprites[0].origin_x = 0;
		sprites[0].origin_y = -sprites[0].height; 
		
		for (var i = 1; i < sprites.length; i++) {
			sprites[i].origin_x = sprites[i-1].origin_x + sprites[i-1].width; 
			sprites[i].origin_y = -sprites[i].height; 

			width += sprites[i].width; Math.max(width, sprites[i].width); 
			height = Math.max(height, sprites[i].height); 
		}

		for (var i = 0; i < sprites.length; i++) 
			sprites[i].origin_y += height; 

		return [width, height]; 
	}
}


var diagonal = {
	pack : function(sprites) {
		var width 	= sprites[0].width; 
		var height 	= sprites[0].height; 
		sprites[0].origin_x = 0;
		sprites[0].origin_y = 0;
		
		for (var i = 1; i < sprites.length; i++) {
			sprites[i].origin_x = sprites[i-1].origin_x + sprites[i-1].width; 
			sprites[i].origin_y = sprites[i-1].origin_y + sprites[i-1].height;

			width 	+= sprites[i].width; 
			height 	+= sprites[i].height; 
		}

		return [width, height]; 
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
