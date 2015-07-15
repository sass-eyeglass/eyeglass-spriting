/*
 * The pack function modifies the sprites array passed in and adds coordinates to each
 * element. It also calculates the spritemap width and height, and returns them in an array.
 * This file will be refactored.
 */
"use strict";

var sass = require("node-sass");
var sassUtils = require("node-sass-utils")(sass);

var getPackingFunction = function(strategy, alignment, spacing) {
	if (!spacing) {
		spacing = 0;
	}

	switch (strategy) {
		case "vertical":
			if (!alignment) return pack_vertical_left(spacing);
			else if (alignment == "left") return pack_vertical_left(spacing);
			else if (alignment == "right") return pack_vertical_right(spacing);
			else throw Error("Invalid layout alignment");
			break;
		case "horizontal":
			if (!alignment) return pack_horizontal_top(spacing);
			else if (alignment == "top") return pack_horizontal_top(spacing);
			else if (alignment == "bottom") return pack_horizontal_bottom(spacing);
			else throw Error("Invalid layout alignment");
			break;
		case "diagonal":
			return pack_diagonal;
		default:
			throw Error("Invalid layout strategy");
			break;
	}
}

// take in sass map (layout: horizontal, spacing: 50px, alignment: bottom);
function Layout(sassLayout) {
	var layout = sassUtils.castToJs(sassLayout);
	var strategy = layout.coerce.get("strategy");
	var spacing = layout.coerce.get("spacing").value;
  var alignment = layout.coerce.get("alignment");

  this.strategy = strategy;
  this.spacing = spacing;
  this.alignment = alignment;

  this.pack = getPackingFunction(this.strategy, this.alignment, this.spacing);
}

var pack_vertical_left = function(spacing) {
	return function(sprites) {
		var width = sprites[0].width;
		var height = sprites[0].height;
		sprites[0].origin_x = 0;
		sprites[0].origin_y = 0;

		for (var i = 1; i < sprites.length; i++) {
			sprites[i].origin_x = 0;
			sprites[i].origin_y = sprites[i-1].origin_y + sprites[i-1].height + spacing;

			width = Math.max(width, sprites[i].width);
			height += sprites[i].height + spacing;
		}

		return [width, height];
	}
}

var pack_vertical_right = function(spacing) {
	return function(sprites) {
		var width = sprites[0].width;
		var height = sprites[0].height;
		sprites[0].origin_x = -sprites[0].width;
		sprites[0].origin_y = 0;

		for (var i = 1; i < sprites.length; i++) {
			sprites[i].origin_x = -sprites[i].width;
			sprites[i].origin_y = sprites[i-1].origin_y + sprites[i-1].height + spacing;

			width = Math.max(width, sprites[i].width);
			height += sprites[i].height + spacing;
		}

		for (var i = 0; i < sprites.length; i++)
			sprites[i].origin_x += width;

		return [width, height];
	}
}

var pack_horizontal_top = function(spacing) {
	return function(sprites) {
		var width = sprites[0].width;
		var height = sprites[0].height;
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

var pack_horizontal_bottom = function(spacing) {
	return function(sprites) {
		var width = sprites[0].width;
		var height = sprites[0].height;
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

var pack_diagonal = function(sprites) {
	var width = sprites[0].width;
	var height = sprites[0].height;
	sprites[0].origin_x = 0;
	sprites[0].origin_y = 0;

	for (var i = 1; i < sprites.length; i++) {
		sprites[i].origin_x = sprites[i-1].origin_x + sprites[i-1].width;
		sprites[i].origin_y = sprites[i-1].origin_y + sprites[i-1].height;

		width += sprites[i].width;
		height += sprites[i].height;
	}

	return [width, height];
}

Layout.prototype.setSpacing = function(spacing) {
	this.spacing = spacing;
	this.pack = getPackingFunction(this.strategy, this.alignment, this.spacing);
}

module.exports = Layout;
