"use strict";

var path = require("path");
var fs = require("fs");

describe("spritebuilder", function () {

    it("can require sprite-builder", function (done) {
    	var sb = require("../spritebuilder");
    	done(); 
    });

    it("can require lwip", function (done) {
    	var lwip = require("lwip");
    	done(); 
    }); 

    it("can open image", function (done) {
    	var lwip = require("lwip");
    	lwip.open(path.join(__dirname, 'image.png'), function(err, image) {
    		if (err) throw err; 
    		else done(); 
    	});
    }); 

    it("can manipulate and save new image", function (done) {
    	var lwip = require("lwip");
    	lwip.open(path.join(__dirname, 'image.png'), function(err, image) {
    		if (err) throw err; 
    		image.batch()
			    .scale(0.75)          // scale to 75%
			    .rotate(45, 'white')  // rotate 45degs clockwise (white fill)
			    .crop(200, 200)       // crop a 200X200 square from center
			    .blur(5)              // Gaussian blur with SD=5
			    .writeFile('output.png', function(err){
			    	done(); 
			    });
    	});
    }); 

    // create an image of certain dimension, create sprite map and check dimensions 

    // create multiple images, create sprite map and check dimensions 

    

});
