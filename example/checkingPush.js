var stream = require("vintage-streams");
var rs = stream.Readable();
var cnt = 0;

rs._read = function (cb) {
  cb(null, Buffer("" + cnt++));
};

rs.on("data", function (data) {
  console.log(data); // first 0, then 1, ...
});
