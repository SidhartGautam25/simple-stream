const Writable = require("../lib/writeable");

const myWritable = new Writable({
  write(chunk, cb) {
    // Simulate async write (e.g. file write or network send)
    setTimeout(() => {
      console.log("[WRITE]", chunk.toString());
      cb(null);
    }, 100);
  },
  end(cb) {
    console.log("[END] Stream has ended.");
    cb(null);
  },
  destroy(cb) {
    console.log("[DESTROY] Stream destroyed.");

    cb(null);
  },
});

console.log("mywritable is ", myWritable);

myWritable.on("drain", () => console.log("[EVENT] drain"));
myWritable.on("finish", () => console.log("[EVENT] finish"));
myWritable.on("close", () => console.log("[EVENT] close"));
myWritable.on("error", (err) => console.error("[ERROR]", err.message));

// 🧪 Use the stream
console.log('[ACTION] Writing "hello"');
myWritable.write("hello");

console.log("[ACTION] Corking stream");
myWritable.cork();

console.log('[ACTION] Writing "world" (should be buffered)');
myWritable.write("world");

console.log("[ACTION] Uncorking stream (should flush buffer)");
myWritable.uncork();

setTimeout(() => {
  console.log('[ACTION] Calling end() with "done"');
  myWritable.end("done");
}, 500);
