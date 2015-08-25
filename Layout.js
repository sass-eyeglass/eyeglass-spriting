/*
 * The pack function modifies the sprites array passed in and adds coordinates to each
 * element. It also calculates the spritemap width and height, and returns them in an array.
 * This file will be refactored.
 */

 // TODO: add documentation for registering custom layouts
 // TOOO: refactor registering layouts thing

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

var smartKdValidate = function(options) {
  return true;
};

function smartKdLayout(options) {

  this.pack = function(sprites) {
    function Node(x1, y1, x2, y2) {
      this.left = null;
      this.right = null;

      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;

      this.occupied = false;
    }

    Node.prototype.insert = function(sprite, splitVertically, depth) {
      // console.log("(" + this.x1 + ", " + this.y1 + ") | (" + this.x2 + ", " + this.y2 + ")");

      // not a leaf node
      if (this.left && this.right) {
        var newNode = this.left.insert(sprite, !splitVertically, depth + 1);
        if (newNode) {
          return newNode;
        } else {
          return this.right.insert(sprite, !splitVertically, depth + 1);
        }
      } else { // is a leaf node
        // occupied node
        if (this.occupied) {
          return null;
        }

        // node is too small
        var width = this.x2 - this.x1;
        var height = this.y2 - this.y1;
        if (sprite.width > width || sprite.height > height) {
          return null;
        }

        // node is just right
        if (sprite.width === width && sprite.height === height) {
          // console.log("inserting in this node: ", this);
          sprite.originX = this.x1;
          sprite.originY = this.y1;
          this.occupied = true;
          return this;
        }

        if (splitVertically) {
          // console.log("split node vertically");
          this.left = new Node(this.x1, this.y1, this.x1 + sprite.width, this.y2);
          this.right = new Node(this.x1 + sprite.width, this.y1, this.x2, this.y2);
        } else {
          // console.log("split node horizontally");
          this.left = new Node(this.x1, this.y1, this.x2, this.y1 + sprite.height);
          this.right = new Node(this.x1, this.y1 + sprite.height, this.x2, this.y2);
        }
        // console.log(this.left);
        return this.left.insert(sprite, !splitVertically, depth + 1);
      }
    };

    // shuffle sprites
    for (var j, x, y = sprites.length; y; j = Math.floor(Math.random() * y),
                                          x = sprites[--y],
                                          sprites[y] = sprites[j],
                                          sprites[j] = x) {
      // meep
    }

    var firstNode = new Node(0, 0, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

    var spritemapWidth = 0;
    var spritemapHeight = 0;

    for (var i = 0; i < sprites.length; i++) {
      // console.log("inserting sprite of dimensions: " + sprites[i].width
      //           + " x " + sprites[i].height);
      firstNode.insert(sprites[i], false, 0);
      if (sprites[i].originX + sprites[i].width > spritemapWidth) {
        spritemapWidth = sprites[i].originX + sprites[i].width;
      }

      if (sprites[i].originY + sprites[i].height > spritemapHeight) {
        spritemapHeight = sprites[i].originY + sprites[i].height;
      }
    }

    // console.log(sprites);
    return [spritemapWidth, spritemapHeight];
  };
}

var smartKorfValidate = function(options) {
  return true;
};

function smartKorfLayout(options) {
  function Cells(width, height) {
    this.rows = [{position: 0, height: height}];
    this.cols = [{position: 0, width: width}];
    this.occupied = [[false]];
  }

  // TODO: what if height = row.height?
  Cells.prototype.insertRow = function(index, newHeight) {
    if (newHeight < this.rows[index].height) {
      // make new row and insert
      var newRow = {
        position: this.rows[index].position + newHeight,
        height: this.rows[index].height - newHeight
      };
      this.rows.splice(index + 1, 0, newRow);

      this.rows[index].height = newHeight;

      // set occupied
      var newOccupied = this.occupied[index].slice();
      this.occupied.splice(index + 1, 0, newOccupied);
    }
  };

  // TODO: what if width = col.width?
  Cells.prototype.insertCol = function(index, newWidth) {
    if (newWidth < this.cols[index].width) {
      // make new col and insert
      var newCol = {
        position: this.cols[index].position + newWidth,
        width: this.cols[index].width - newWidth
      };
      this.cols.splice(index + 1, 0, newCol);

      this.cols[index].width = newWidth;

      // set occupied
      for (var row = 0; row < this.rows.length; row++) {
        this.occupied[row].splice(index + 1, 0, this.occupied[row][index]);
      }
    }
  };

  // let's assume the sprite fits and doesn't cover any occupied cells
  // TODO: make this a private function?
  // TODO: refactor this pls
  Cells.prototype.insertSprite = function(startRow, startCol, endRow, endCol, spriteWidth, spriteHeight) {
    // what if endRow === startRow or something ugh ok
    var row, col, remainingWidth, remainingHeight;
    // console.log(startCol, startCol, endRow, endCol);

    if (startRow === endRow && startCol === endCol) {
      this.insertRow(startRow, spriteHeight);
      this.insertCol(startCol, spriteWidth);
      this.setOccupied(startRow, startCol, true);
    } else if (startRow === endRow) {
      this.insertRow(startRow, spriteHeight);

      for (col = startCol; col < endCol; col++) {
        this.setOccupied(startRow, col, true);
      }

      remainingWidth = spriteWidth - (this.cols[endCol - 1].position
                                  + this.cols[endCol - 1].width - this.cols[startCol].position);
      this.insertCol(endCol, remainingWidth);
      this.setOccupied(startRow, endCol, true);
    } else if (startCol === endCol) {
      this.insertCol(startCol, spriteWidth);

      for (row = startRow; row < endRow; row++) {
        this.setOccupied(row, startCol, true);
      }

      remainingHeight = spriteHeight - (this.rows[endRow - 1].position
                                  + this.rows[endRow - 1].height - this.rows[startRow].position);
      this.insertRow(endRow, remainingHeight);
      this.setOccupied(endRow, startCol, true);
    } else {
      for (row = startRow; row < endRow; row++) {
        for (col = startCol; col < endCol; col++) {
          this.setOccupied(row, col, true);
        }
      }

      remainingWidth = spriteWidth - (this.cols[endCol - 1].position
                                  + this.cols[endCol - 1].width - this.cols[startCol].position);
      remainingHeight = spriteHeight - (this.rows[endRow - 1].position
                                  + this.rows[endRow - 1].height - this.rows[startRow].position);

      this.insertRow(endRow, remainingHeight);
      this.insertCol(endCol, remainingWidth);

      // set occupieds
      for (row = startRow; row <= endRow; row++) {
        this.setOccupied(row, endCol, true);
      }

      for (col = startCol; col <= endCol; col++) {
        this.setOccupied(endRow, col, true);
      }
    }
    this.setOccupied(endRow, endCol, true);
  };

  Cells.prototype.setOccupied = function(row, col, occupied) {
    this.occupied[row][col] = occupied;
  };

  Cells.prototype.fitsCol = function(col, spriteWidth) {
    return spriteWidth <= this.cols[col].width;
  };

  Cells.prototype.fitsRow = function(row, spriteHeight) {
    return spriteHeight <= this.rows[row].height;
  };

  // check all cells below and to the right of the current cell
  Cells.prototype.fits = function(row, col, spriteWidth, spriteHeight) {
    var startRow = row;
    var startCol = col;
    var endRow = startRow;
    var endCol = startCol;

    // increment endCol until totalWidth > spriteWidth
    var totalWidth = this.cols[endCol].width;
    while (totalWidth < spriteWidth && endCol < this.cols.length - 1) {
      endCol++;
      totalWidth += this.cols[endCol].width;
    }

    if (totalWidth < spriteWidth) {
      return false;
    }

    // increment endRow until totalHeight > spriteHeight
    var totalHeight = this.rows[endRow].height;
    while (totalHeight < spriteHeight && endRow < this.rows.length - 1) {
      endRow++;
      totalHeight += this.rows[endRow].height;
    }

    if (totalHeight < spriteHeight) {
      return false;
    }

    // check if covers any occupied cells
    for (row = startRow; row <= endRow; row++) {
      for (col = startCol; col <= endCol; col++) {
        if (this.occupied[row][col]) {
          return false;
        }
      }
    }

    return [endRow, endCol];
  };

  Cells.prototype.addSprite = function(sprite) {
    // check from left to right; put sprite in leftmost uppermost position possible
    for (var col = 0; col < this.cols.length; col++) {
      for (var row = 0; row < this.rows.length; row++) {
        var endCell = this.fits(row, col, sprite.width, sprite.height);
        if (endCell) {
          var endRow = endCell[0];
          var endCol = endCell[1];
          this.insertSprite(row, col, endRow, endCol, sprite.width, sprite.height);
          sprite.originX = this.cols[col].position;
          sprite.originY = this.rows[row].position;

          return true;
        }
      }
    }
    return false;
  };

  this.pack = function(sprites) {
    var i;

    // TODO: maybe set a tolerance for same height/width?
    var sameHeights = true;
    var sameWidths = true;

    for (i = 0; i < sprites.length && (sameHeights || sameWidths); i++) {
      if (i > 0 && sprites[i].height !== sprites[i - 1].height) {
        sameHeights = false;
      }

      if (i > 0 && sprites[i].width !== sprites[i - 1].width) {
        sameWidths = false;
      }
    }

    if (sameHeights) {
      console.log("sprites all have same height - pack horizontally");
      return new horizontalLayout({}).pack(sprites);
    } else if (sameWidths) {
      console.log("sprites all have same widths - pack vertically");
      return new verticalLayout({}).pack(sprites);
    }

    var minHeight = 0;
    var minArea = 0;
    var totalHeight = 0;
    for (i = 0; i < sprites.length; i++) {
      if (sprites[i].height > minHeight) {
        minHeight = sprites[i].height;
      }
      minArea += sprites[i].width * sprites[i].height;
      totalHeight += sprites[i].height;
      sprites[i].position = i;
    }

    var compareByWidth = function(sprite1, sprite2) {
      return sprite2.width - sprite1.width;
    };

    var compareByHeight = function(sprite1, sprite2) {
      return sprite2.height - sprite1.height;
    };

    var compareByHeightStable = function(sprite1, sprite2) {
      if (sprite2.height === sprite1.height) {
        return sprite2.position - sprite1.position;
      } else {
        return sprite2.height - sprite1.height;
      }
    };

    var compareByArea = function(sprite1, sprite2) {
      return (sprite2.width * sprite2.height) - (sprite1.width * sprite1.height);
    };

    // sprites.sort(compareByArea);
    sprites.sort(compareByWidth);
    // sprites.sort(compareByHeightStable);
    // sprites.sort(compareByHeight);

    var getByValue = function(thing) {
      return JSON.parse(JSON.stringify(thing));
    };

    var getAcceptanceProbability = function(area, newArea, temp) {
      if (newArea < area) {
        return 1.0;
      }
      var delta = (area - newArea) / minArea;
      return Math.exp(delta * 1000 / temp);
    };

    // could infinite loop
    var getNeighbouringSolutionNext = function(solution) {
      var width = solution.width - 1;
      var height = solution.height + 1;

      var neighbourFound = false;

      while (!neighbourFound) {
        var cells = new Cells(width, height);

        var allSpritesAdded = true;

        for (i = 0; i < sprites.length; i++) {
          if (!cells.addSprite(sprites[i])) {
            allSpritesAdded = false;
            break;
          }
        }

        if (allSpritesAdded) {
          neighbourFound = true;
          var spritemapWidth = 0;
          var spritemapHeight = 0;

          for (i = 0; i < sprites.length; i++) {
            spritemapWidth = Math.max(spritemapWidth, sprites[i].originX + sprites[i].width);
            spritemapHeight = Math.max(spritemapHeight, sprites[i].originY + sprites[i].height);
          }

          return {
            width: spritemapWidth,
            height: spritemapHeight,
            sprites: JSON.parse(JSON.stringify(sprites))
          };
        }

        width--;
        height++;
      }
    };

    var getNeighbouringSolutionRandom = function(solution) {
      var width = Number.POSITIVE_INFINITY;
      var height = minHeight + Math.ceil(Math.random() * (totalHeight - minHeight));

      var neighbourFound = false;

      while (!neighbourFound) {
        var cells = new Cells(width, height);

        var allSpritesAdded = true;

        for (i = 0; i < sprites.length; i++) {
          if (!cells.addSprite(sprites[i])) {
            allSpritesAdded = false;
            break;
          }
        }

        if (allSpritesAdded) {
          neighbourFound = true;
          var spritemapWidth = 0;
          var spritemapHeight = 0;

          for (i = 0; i < sprites.length; i++) {
            spritemapWidth = Math.max(spritemapWidth, sprites[i].originX + sprites[i].width);
            spritemapHeight = Math.max(spritemapHeight, sprites[i].originY + sprites[i].height);
          }

          var newSolution = {
            width: spritemapWidth,
            height: spritemapHeight,
            sprites: getByValue(sprites)
          };

          return newSolution;
        }

        height = minHeight + Math.ceil(Math.random() * (totalHeight - minHeight));
      }
    };

    var getNeighbouringSolutionRandomish = function(solution) {
      var width = Number.POSITIVE_INFINITY;
      var height = solution.height - Math.ceil(totalHeight / sprites.length);
      var pickRandom = false;

      if (solution.height === minHeight || Math.random() > 0.5) {
        pickRandom = true;
        height = minHeight + Math.ceil(Math.random() * (totalHeight - minHeight));
      }

      var neighbourFound = false;

      while (!neighbourFound) {
        var cells = new Cells(width, height);

        var allSpritesAdded = true;

        for (i = 0; i < sprites.length; i++) {
          if (!cells.addSprite(sprites[i])) {
            allSpritesAdded = false;
            break;
          }
        }

        if (allSpritesAdded) {
          neighbourFound = true;
          var spritemapWidth = 0;
          var spritemapHeight = 0;

          for (i = 0; i < sprites.length; i++) {
            spritemapWidth = Math.max(spritemapWidth, sprites[i].originX + sprites[i].width);
            spritemapHeight = Math.max(spritemapHeight, sprites[i].originY + sprites[i].height);
          }

          var newSolution = {
            width: spritemapWidth,
            height: spritemapHeight,
            sprites: getByValue(sprites)
          };

          return newSolution;
        }

        height -= Math.ceil(totalHeight / sprites.length);

        if (height < minHeight || pickRandom) {
          height = minHeight + Math.ceil(Math.random() * (totalHeight - minHeight));
        }
      }
    };

    var getNeighbouringSolutionReorder = function(solution) {
      var index1, index2, temp;
      var reorderedSprites = solution.sprites.slice();

      var pickRandom = false;
      var width = Number.POSITIVE_INFINITY;
      var height;
      var maxSwaps = 5;

      if (Math.random() > 0.5) {
        pickRandom = true;
        reorderedSprites.sort(compareByHeight);
        height = minHeight + Math.ceil(Math.random() * (totalHeight - minHeight));
      } else {
        // randomly swap two sprites
        index1 = Math.floor(Math.random() * reorderedSprites.length);
        index2 = Math.floor(Math.random() * reorderedSprites.length);
        while (index2 === index1) {
          index2 = Math.floor(Math.random() * reorderedSprites.length);
        }
        temp = reorderedSprites[index1];
        reorderedSprites[index1] = getByValue(reorderedSprites[index2]);
        reorderedSprites[index2] = getByValue(temp);
        height = solution.height;
      }

      var neighbourFound = false;
      var numSwaps = 0;

      while (!neighbourFound) {
        numSwaps++;
        var cells = new Cells(width, height);

        var allSpritesAdded = true;

        for (i = 0; i < reorderedSprites.length; i++) {
          if (!cells.addSprite(reorderedSprites[i])) {
            allSpritesAdded = false;
            break;
          }
        }

        if (allSpritesAdded) {
          neighbourFound = true;
          var spritemapWidth = 0;
          var spritemapHeight = 0;

          for (i = 0; i < reorderedSprites.length; i++) {
            spritemapWidth = Math.max(spritemapWidth, reorderedSprites[i].originX + reorderedSprites[i].width);
            spritemapHeight = Math.max(spritemapHeight, reorderedSprites[i].originY + reorderedSprites[i].height);
          }

          var newSolution = {
            width: spritemapWidth,
            height: spritemapHeight,
            sprites: getByValue(reorderedSprites)
          };

          return newSolution;
        }

        if (pickRandom) {
          height = minHeight + Math.ceil(Math.random() * (totalHeight - minHeight));
        } else {
          if (numSwaps > maxSwaps) {
            pickRandom = true;
            sprites.sort(compareByHeight);
            height = minHeight + Math.ceil(Math.random() * (totalHeight - minHeight));
          } else {
            index1 = Math.floor(Math.random() * reorderedSprites.length);
            index2 = Math.floor(Math.random() * reorderedSprites.length);
            while (index2 === index1) {
              index2 = Math.floor(Math.random() * reorderedSprites.length);
            }

            temp = reorderedSprites[index1];
            reorderedSprites[index1] = getByValue(reorderedSprites[index2]);
            reorderedSprites[index2] = getByValue(temp);
          }
        }
      }
    };

    var getNeighbouringSolutionNextHeight = function(solution) {
      var width = Number.POSITIVE_INFINITY;
      var height = solution.height;

      var getRandomHeight = true;
      if (Math.random() < 0.5) {
        getRandomHeight = false;
      }

      if (getRandomHeight) {
        height = Math.ceil(Math.random() * totalHeight);
      }

      var neighbourFound = false;

      while (!neighbourFound) {
        // console.log(height);
        var cells = new Cells(width, height);

        var allSpritesAdded = true;

        for (i = 0; i < sprites.length; i++) {
          if (!cells.addSprite(sprites[i])) {
            allSpritesAdded = false;
            break;
          }
        }

        if (allSpritesAdded) {
          neighbourFound = true;
          var spritemapWidth = 0;
          var spritemapHeight = 0;

          for (i = 0; i < sprites.length; i++) {
            spritemapWidth = Math.max(spritemapWidth, sprites[i].originX + sprites[i].width);
            spritemapHeight = Math.max(spritemapHeight, sprites[i].originY + sprites[i].height);
          }

          var newSolution = {
            width: spritemapWidth,
            height: spritemapHeight,
            sprites: JSON.parse(JSON.stringify(sprites))
          };

          return newSolution;
        }

        height = Math.ceil(Math.random() * height);
      }
    };

    var runSimulatedAnnealing = function(temp, coolingRate, neighbourSolutionFn) {
      // console.log("cooling rate: " + coolingRate);
      var minTemp = 1;
      var spritemapWidth = 0;
      var spritemapHeight = 0;
      var numTrials = 0;
      var intialHeight = minHeight + Math.ceil(Math.random() * (totalHeight - minHeight));

      // get initial solution
      var cells = new Cells(Number.POSITIVE_INFINITY, intialHeight);

      for (i = 0; i < sprites.length; i++) {
        if (!cells.addSprite(sprites[i])) {
          throw Error("*** ~~~ wut ~~~ ***");
        }
        spritemapWidth = Math.max(spritemapWidth, sprites[i].originX + sprites[i].width);
        spritemapHeight = Math.max(spritemapHeight, sprites[i].originY + sprites[i].height);
      }

      var currentSolution = {
        width: spritemapWidth,
        height: spritemapHeight,
        sprites: getByValue(sprites)
      };

      var bestSolution = currentSolution;

      // search for better solutions
      while (temp > minTemp) {
        numTrials++;

        var newSolution = neighbourSolutionFn(currentSolution);
        var currentArea = currentSolution.width * currentSolution.height;
        var newArea = newSolution.width * newSolution.height;

        if (getAcceptanceProbability(currentArea, newArea, temp) > Math.random()) {
          currentSolution = getByValue(newSolution);
        }

        if (currentSolution.width * currentSolution.height < bestSolution.width * bestSolution.height) {
          bestSolution = getByValue(currentSolution);
        }

        temp *= 1 - coolingRate;
      }

      for (i = 0; i < sprites.length; i++) {
        // bc sprites in bestSolution might be reordered
        sprites[i].originX = bestSolution.sprites[i].originX;
        sprites[i].originY = bestSolution.sprites[i].originY;
        // sprites[i].name = bestSolution.sprites[i].name;
        // sprites[i].lastModified = bestSolution.sprites[i].lastModified;
        // sprites[i].filename = bestSolution.sprites[i].filename;
        // sprites[i].width = bestSolution.sprites[i].width;
        // sprites[i].height = bestSolution.sprites[i].height;
        // // TODO: why do I need to do this
        // bestSolution.width = Math.max(bestSolution.width, sprites[i].originX + sprites[i].width);
        // bestSolution.height = Math.max(bestSolution.height, sprites[i].originY + sprites[i].height);
      }

      var area = bestSolution.width * bestSolution.height;

      console.log(((area - minArea) * 100 / minArea).toFixed(2) + "% bigger than min area");
      // console.log(numTrials + " trials");
      return [bestSolution.width, bestSolution.height];
      // return [bestSolution.width, bestSolution.height, (area - minArea) * 100 / minArea];
    };

    var temp = 10000;
    var coolingRate = Math.min(0.999, sprites.length / 400);

    return runSimulatedAnnealing(temp, coolingRate, getNeighbouringSolutionRandom);
    // return runSimulatedAnnealing(temp, coolingRate, getNeighbouringSolutionRandomish);

    // === random ===

    // var width = Number.POSITIVE_INFINITY;
    // var height = minHeight + Math.ceil(Math.random() * (totalHeight - minHeight));

    // // var maxSolutions = 5000 / sprites.length;
    // var maxSolutions = 14;
    // var numSolutionsFound = 0;
    // var done = false;
    // var bestSolution;

    // while (numSolutionsFound < maxSolutions) {
    //   var cells = new Cells(width, height);

    //   var allSpritesAdded = true;

    //   for (i = 0; i < sprites.length; i++) {
    //     if (!cells.addSprite(sprites[i])) {
    //       allSpritesAdded = false;
    //       break;
    //     }
    //   }

    //   if (allSpritesAdded) {
    //     numSolutionsFound++;

    //     var spritemapWidth = 0;
    //     var spritemapHeight = 0;

    //     for (i = 0; i < sprites.length; i++) {
    //       spritemapWidth = Math.max(spritemapWidth, sprites[i].originX + sprites[i].width);
    //       spritemapHeight = Math.max(spritemapHeight, sprites[i].originY + sprites[i].height);
    //     }

    //     if (!bestSolution || spritemapWidth * spritemapHeight < bestSolution.width * bestSolution.height) {
    //       bestSolution = {
    //         width: spritemapWidth,
    //         height: spritemapHeight,
    //         sprites: getByValue(sprites)
    //       };
    //     }
    //   }

    //   height = minHeight + Math.ceil(Math.random() * (totalHeight - minHeight));
    // }

    // for (i = 0; i < sprites.length; i++) {
    //   // bc sprites in bestSolution might be reordered
    //   sprites[i].originX = bestSolution.sprites[i].originX;
    //   sprites[i].originY = bestSolution.sprites[i].originY;
    //   sprites[i].name = bestSolution.sprites[i].name;
    //   sprites[i].lastModified = bestSolution.sprites[i].lastModified;
    //   sprites[i].filename = bestSolution.sprites[i].filename;
    //   sprites[i].width = bestSolution.sprites[i].width;
    //   sprites[i].height = bestSolution.sprites[i].height;
    //   // TODO: why do I need to do this
    //   // bestSolution.width = Math.max(bestSolution.width, sprites[i].originX + sprites[i].width);
    //   // bestSolution.height = Math.max(bestSolution.height, sprites[i].originY + sprites[i].height);
    // }

    // var area = bestSolution.width * bestSolution.height;

    // console.log(((area - minArea) * 100 / minArea).toFixed(2) + "% bigger than min area");
    // console.log(numSolutionsFound + " solutions tested");

    // return [bestSolution.width, bestSolution.height, (area - minArea) * 100 / minArea];
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
  },
  "smartKd": {
    validate: smartKdValidate,
    constructor: smartKdLayout
  },
  "smartKorf": {
    validate: smartKorfValidate,
    constructor: smartKorfLayout
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
