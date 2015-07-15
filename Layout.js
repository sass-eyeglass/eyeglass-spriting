/*
 * The pack function modifies the sprites array passed in and adds coordinates to each
 * element. It also calculates the spritemap width and height, and returns them in an array.
 * This file will be refactored.
 */
"use strict";

var sass = require("node-sass");
var sassUtils = require("node-sass-utils")(sass);

var packVerticalLeft = function(spacing) {
	return function(sprites) {
		var width = sprites[0].width;
		var height = sprites[0].height;
		sprites[0].originX = 0;
		sprites[0].originY = 0;

		for (var i = 1; i < sprites.length; i++) {
			sprites[i].originX = 0;
			sprites[i].originY = sprites[i - 1].originY + sprites[i - 1].height + spacing;

			width = Math.max(width, sprites[i].width);
			height += sprites[i].height + spacing;
		}

		return [width, height];
	};
};

var packVerticalRight = function(spacing) {
	return function(sprites) {
		var width = sprites[0].width;
		var height = sprites[0].height;
		sprites[0].originX = -sprites[0].width;
		sprites[0].originY = 0;

		for (var i = 1; i < sprites.length; i++) {
			sprites[i].originX = -sprites[i].width;
			sprites[i].originY = sprites[i - 1].originY + sprites[i - 1].height + spacing;

			width = Math.max(width, sprites[i].width);
			height += sprites[i].height + spacing;
		}

		for (var j = 0; j < sprites.length; j++) {
			sprites[j].originX += width;
		}

		return [width, height];
	};
};

var packHorizontalTop = function(spacing) {
	return function(sprites) {
		var width = sprites[0].width;
		var height = sprites[0].height;
		sprites[0].originX = 0;
		sprites[0].originY = 0;

		for (var i = 1; i < sprites.length; i++) {
			sprites[i].originX = sprites[i - 1].originX + sprites[i - 1].width + spacing;
			sprites[i].originY = 0;

			width += sprites[i].width + spacing;
			height = Math.max(height, sprites[i].height);
		}

		return [width, height];
	};
};

var packHorizontalBottom = function(spacing) {
	return function(sprites) {
		var width = sprites[0].width;
		var height = sprites[0].height;
		sprites[0].originX = 0;
		sprites[0].originY = -sprites[0].height;

		for (var i = 1; i < sprites.length; i++) {
			sprites[i].originX = sprites[i - 1].originX + sprites[i - 1].width + spacing;
			sprites[i].originY = -sprites[i].height;

			width += sprites[i].width + spacing;
			height = Math.max(height, sprites[i].height);
		}

		for (var j = 0; j < sprites.length; j++) {
			sprites[j].originY += height;
		}

		return [width, height];
	};
};

var packDiagonal = function(sprites) {
	var width = sprites[0].width;
	var height = sprites[0].height;
	sprites[0].originX = 0;
	sprites[0].originY = 0;

	for (var i = 1; i < sprites.length; i++) {
		sprites[i].originX = sprites[i - 1].originX + sprites[i - 1].width;
		sprites[i].originY = sprites[i - 1].originY + sprites[i - 1].height;

		width += sprites[i].width;
		height += sprites[i].height;
	}

	return [width, height];
};

// returns packing function, also does error checking on options
var getPackingFunction = function(strategy, alignment, spacing) {
	if (!spacing) {
		spacing = 0;
	}

	switch (strategy) {
		case "vertical":
			if (!alignment) {
				return packVerticalLeft(spacing);
			} else if (alignment === "left") {
				return packVerticalLeft(spacing);
			} else if (alignment === "right") {
				return packVerticalRight(spacing);
			} else {
				throw Error("Invalid layout alignment");
			}
			break;
		case "horizontal":
			if (!alignment) {
				return packHorizontalTop(spacing);
			} else if (alignment === "top") {
				return packHorizontalTop(spacing);
			} else if (alignment === "bottom") {
				return packHorizontalBottom(spacing);
			} else {
				throw Error("Invalid layout alignment");
			}
			break;
		case "diagonal":
			return packDiagonal;
		default:
			throw Error("Invalid layout strategy");
	}
};

// take in sass map (layout: horizontal, spacing: 50px, alignment: bottom);
function Layout(sassLayout) {
	var layout = sassUtils.castToJs(sassLayout);

  this.strategy = layout.coerce.get("strategy");
  this.spacing = layout.coerce.get("spacing").value;
  this.alignment = layout.coerce.get("alignment");

  this.pack = getPackingFunction(this.strategy, this.alignment, this.spacing);
}

var validate = function(sassLayout) {
	var layout = sassUtils.castToJs(sassLayout);
  var strategy = layout.coerce.get("strategy");
  var spacing = layout.coerce.get("spacing").value;
  var alignment = layout.coerce.get("alignment");
  getPackingFunction(strategy, alignment, spacing);
};

// Layout.prototype.setSpacing = function(spacing) {
// 	this.spacing = spacing;
// 	this.pack = getPackingFunction(this.strategy, this.alignment, this.spacing);
// };

module.exports = {
	Layout: Layout,
	validate: validate
};
