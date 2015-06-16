
var vertical_left = {
	getAllCoordinates : function(data) {
		var coordinates = []; 
		coordinates[0] = [0, 0];
		for (var i = 1; i < data.length; i++) {
			coordinates[i] = [0, coordinates[i-1][1] + data[i-1].height];
		}
		return coordinates; 
	}, 
	getSpritemapDimensions : function(data) {
		var width = 0; 
		var height = 0; 
		for (var i = 0; i < data.length; i++) {
			width = Math.max(width, data[i].width)
			height += data[i].height; 
		}
		return [width, height];
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
