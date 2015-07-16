/*
 * The pack function modifies the sprites array passed in and adds coordinates to each
 * element. It also calculates the spritemap width and height, and returns them in an array.
 * This file will be refactored.
 */

"use strict";

var sass = require("node-sass");
var sassUtils = require("node-sass-utils")(sass);

var verticalValidate = function(options) {
  if (options.alignment && options.alignment !== "left" && options.alignment !== "right") {
    throw new Error("Invalid layout alignment: \'" + options.alignment + "\'.");
  }
  if (options.spacing && options.spacing < 0) {
    throw new Error("Invalid layout spacing: \'" + options.spacing + " px\'.");
  }
  return true;
};

function verticalLayout(options) {
  var spacing = options.spacing || 0;
  var alignment = options.alignment || "left";

  this.pack = function(sprites) {
    var width = sprites[0].width;
    var height = sprites[0].height;
    sprites[0].originX = (alignment === "left") ? 0 : -sprites[0].width;
    sprites[0].originY = 0;

    for (var i = 1; i < sprites.length; i++) {
      sprites[i].originX = (alignment === "left") ? 0 : -sprites[i].width;
      sprites[i].originY = sprites[i - 1].originY + sprites[i - 1].height + spacing;

      width = Math.max(width, sprites[i].width);
      height += sprites[i].height + spacing;
    }

    if (alignment === "right") {
      for (var j = 0; j < sprites.length; j++) {
        sprites[j].originX += width;
      }
    }

    return [width, height];
  };
}

var horizontalValidate = function(options) {
  if (options.alignment && options.alignment !== "top" && options.alignment !== "bottom") {
    throw new Error("Invalid layout alignment: \'" + options.alignment + "\'.");
  }
  if (options.spacing && options.spacing < 0) {
    throw new Error("Invalid layout spacing: \'" + options.spacing + " px\'.");
  }
  return true;
};

function horizontalLayout(options) {
  var spacing = options.spacing || 0;
  var alignment = options.alignment || "top";

  this.pack = function(sprites) {
    // console.log("*** spacing:\n" + spacing);
    var width = sprites[0].width;
    var height = sprites[0].height;
    sprites[0].originX = 0;
    sprites[0].originY = (alignment === "top") ? 0 : -sprites[0].height;

    for (var i = 1; i < sprites.length; i++) {
      sprites[i].originX = sprites[i - 1].originX + sprites[i - 1].width + spacing;
      sprites[i].originY = (alignment === "top") ? 0 : -sprites[i].height;

      width += sprites[i].width + spacing;
      height = Math.max(height, sprites[i].height);
    }

    if (alignment === "bottom") {
      for (var j = 0; j < sprites.length; j++) {
        sprites[j].originY += height;
      }
    }

    return [width, height];
  };
}

var diagonalValidate = function(options) {
  return true;
};

function diagonalLayout(options) {
  // spacing and alignment don't apply
  // TODO: should we throw error if user tries to specify spacing/alignment?

  this.pack = function(sprites) {
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
}

var registeredLayouts = {
  "vertical": {
    validate: verticalValidate,
    constructor: verticalLayout
  },
  "horizontal": {
    validate: horizontalValidate,
    constructor: horizontalLayout
  },
  "diagonal": {
    validate: diagonalValidate,
    constructor: diagonalLayout
  }
};


module.exports = {
  getLayout: function(options) {
    options = sassUtils.castToJs(options);

    var unpackedOptions = {
      strategy: options.coerce.get("strategy"),
      spacing: options.coerce.get("spacing").value,
      alignment: options.coerce.get("alignment")
    };

    var strategy = unpackedOptions.strategy;

    if (registeredLayouts[strategy]) {
      registeredLayouts[strategy].validate(unpackedOptions);

      var newLayout = new registeredLayouts[strategy].constructor(unpackedOptions);
      newLayout.strategy = unpackedOptions.strategy;
      newLayout.spacing = unpackedOptions.spacing;
      newLayout.alignment = unpackedOptions.alignment;

      return newLayout;
    } else {
      throw new Error("Invalid layout strategy: \'" + strategy + "\'.");
    }
  },

  registerLayout: function(name, validate, pack) {
    registeredLayouts[name] = {
      validate: validate,
      constructor: function(options) {
        this.pack = pack;
      }
    };
  },

  validate: function(options) {
    options = sassUtils.castToJs(options);

    var unpackedOptions = {
      strategy: options.coerce.get("strategy"),
      spacing: options.coerce.get("spacing").value,
      alignment: options.coerce.get("alignment")
    };

    if (!registeredLayouts[unpackedOptions.strategy]) {
      throw new Error("Invalid layout strategy: \'" + unpackedOptions.strategy + "\'.");
    } else {
      return registeredLayouts[unpackedOptions.strategy].validate(unpackedOptions);
    }
  },

  registeredLayouts: registeredLayouts
};
