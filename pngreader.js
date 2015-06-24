var fs = require("fs");

var readChunks = function(filename) {

  console.log("reading \'" + filename + "\'");

  pngHeader = ['89', '50', '4e', '47', 'd', 'a', '1a', 'a'];

  fs.open(filename, "r", function(status, fd) {
    if (status) {
      console.log(status.message);
      return;
    }

    var buffer = new Buffer(100);

    fs.read(fd, buffer, 0, 100, 0, function(err, num) {

      var i;

      // png file header
      for (i = 0; i < 8; i++) {
        if (buffer[i].toString(16) != pngHeader[i]){
          console.log("invalid PNG file!");
          return;
        }
      }
      // parseInt(hexString, 16);

      // chunk length
      for (; i < 12; i++) {

      }

      // chunk type
      for (; i < 12; i++) {

      }

      // chunk data
      for (; i < 12; i++) {

      }

      // width
      for (; i < 12; i++) {

      }

      // height
      for (; i < 12; i++) {

      }

      // bit depth
      // colour type
      // compression method
      // filter method
      // interlace method

    })


    // IHDR chunk
    // one or more consecutive IDAT chunks
    // IEND chunk


/*

each chunk:
- length (4)
- type (4)
- chunk data (0 - 2,147,483,647)
- CRC (4) - covers chunk type and chunk data

*/

  })


}

var readChunkTypes = function(filename) {

  console.log("reading \'" + filename + "\'");

  pngHeader = ['89', '50', '4e', '47', 'd', 'a', '1a', 'a'];

  fs.open(filename, "r", function(status, fd) {
    if (status) {
      console.log(status.message);
      return;
    }

    var buffer = new Buffer(1000);

    fs.read(fd, buffer, 0, 1000, 0, function(err, num) {

      var i;

      // png file header
      for (i = 0; i < 8; i++) {
        if (buffer[i].toString(16) != pngHeader[i]){
          console.log("invalid PNG file!");
          return;
        }
      }
      // parseInt(hexString, 16);

      var moreChunks = true;
      var chunkNum = 1;

      while(moreChunks) {
        console.log("\n*** chunk #" + chunkNum + " ***");

        var startByte = i;

        var length = ""; // 4 bytes
        var type = ""; // 4 bytes
        var data = [];
        var CRC = ""; // 4 bytes

        // length
        for (; i < startByte + 4; i++) {
          length += buffer[i];
        }
        length = parseInt(length);

        // type
        for (; i < startByte + 8; i++) {
          type += String.fromCharCode(buffer[i]);
        }

        // data
        for (; i < startByte + 8 + length; i++) {
          // data.push(buffer[i].toString(16));
        }

        for (; i < startByte + 8 + length + 4; i++) {
          // CRC += buffer[i];
        }

        console.log("length: ", parseInt(length));
        console.log("type: ", type);
        // console.log("data: ", data);
        // console.log("CRC: ", CRC);

        if (type == "IEND") moreChunks = false;
        if (chunkNum > 10) moreChunks = false;

        chunkNum++;

      }

    });

  })

}

// encode message in the pixels of image and output png file with encoded image
var encodeMessage = function(imagefile, message) {

}

// read encoded message in the pixels of image; return message as string
var decodeMessage = function(imagefile) {

}

var getLastModifiedDate = function(filename) {

  fs.stat(filename, function(err, stats) {
    if (err) throw err;
    console.log(stats.mtime);
  })

}

getLastModifiedDate(process.argv[2]);
// readChunkTypes(process.argv[2]);
