
/* The pack function modifies the sprites array passed in and adds coordinates to each
 * element. It also calculates the spritemap width and height, and returns them in an array.
 */

// TODO: change to object that has a spacing variable?

function Layout(layout, options) {

	this.layout = layout;
	this.spacing = 0;

	if (options.spacing) this.spacing = options.spacing;
	if (options.alignment) this.alignment = options.alignment;
	this.spacing = options.spacing

}

var vertical_left = {
	pack : function(sprites, spacing) {
		var width 	= sprites[0].width;
		var height 	= sprites[0].height;
		sprites[0].origin_x = 0;
		sprites[0].origin_y = 0;

		for (var i = 1; i < sprites.length; i++) {
			sprites[i].origin_x = 0;
			sprites[i].origin_y = sprites[i-1].origin_y + sprites[i-1].height + spacing;

			width 	= Math.max(width, sprites[i].width);
			height += sprites[i].height + spacing;
		}

		return [width, height];
	}
}

var vertical_right = {
	pack : function(sprites, spacing) {
		var width 	= sprites[0].width;
		var height 	= sprites[0].height;
		sprites[0].origin_x = -sprites[0].width;
		sprites[0].origin_y = 0;

		for (var i = 1; i < sprites.length; i++) {
			sprites[i].origin_x = -sprites[i].width;
			sprites[i].origin_y = sprites[i-1].origin_y + sprites[i-1].height + spacing;

			width 	= Math.max(width, sprites[i].width);
			height += sprites[i].height + spacing;
		}

		for (var i = 0; i < sprites.length; i++)
			sprites[i].origin_x += width;

		return [width, height];
	}
}

var horizontal_top = {
	pack : function(sprites, spacing) {
		var width 	= sprites[0].width;
		var height 	= sprites[0].height;
		sprites[0].origin_x = 0;
		sprites[0].origin_y = 0;

		for (var i = 1; i < sprites.length; i++) {
			sprites[i].origin_x = sprites[i-1].origin_x + sprites[i-1].width + spacing;
			sprites[i].origin_y = 0;

			width += sprites[i].width + spacing;
			height = Math.max(height, sprites[i].height);
		}

		return [width, height];
	}
}

var horizontal_bottom = {
	pack : function(sprites, spacing) {
		var width 	= sprites[0].width;
		var height 	= sprites[0].height;
		sprites[0].origin_x = 0;
		sprites[0].origin_y = -sprites[0].height;

		for (var i = 1; i < sprites.length; i++) {
			sprites[i].origin_x = sprites[i-1].origin_x + sprites[i-1].width + spacing;
			sprites[i].origin_y = -sprites[i].height;

			width += sprites[i].width + spacing;
			height = Math.max(height, sprites[i].height);
		}

		for (var i = 0; i < sprites.length; i++)
			sprites[i].origin_y += height;

		return [width, height];
	}
}

var diagonal = {
	pack : function(sprites, spacing) {
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

// getLayoutStyle("vertical", {spacing: 5px, alignment: "right"});
module.exports.getLayoutStyle = function(layout, options) {
	switch (layout) {
		case "vertical":
			if (!options.alignment) return vertical_left;
			else if (options.alignment == "left") return vertical_left;
			else if (options.alignment == "right") return vertical_right;
			else return vertical_left;
		case "horizontal":
			if (!options.alignment) return horizontal_top;
			else if (options.alignment == "top") return horizontal_top;
			else if (options.alignment == "bottom") return horizontal_bottom;
			else return horizontal_top;
		case "diagonal":
			return diagonal;
		default:
			return vertical_left;
	}
}

// module.exports.getPackingStyle = function(str) {
// 	switch (str) {
// 		case '-vl' :
// 			return vertical_left;
// 		case '-ht' :
// 			return horizontal_top;
// 		case '-vr' :
// 			return vertical_right;
// 		case '-hb' :
// 			return horizontal_bottom;
// 		case '-d'  :
// 			return diagonal;
// 		default : // do vertical left-aligned packing by default
// 			return vertical_left;
// 	}
// }
