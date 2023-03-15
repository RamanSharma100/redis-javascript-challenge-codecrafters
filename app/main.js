const net = require("net");

console.log("Logs from your program will appear here!!");

const server = net.createServer((connection) => {
  connection.on("data", (data) => {
    const commands = data.toString().trim().split("\r\n");
    console.log(commands);
    console.log(commands[2]);
    if (commands[2].toUpperCase() === "PING") {
      connection.write("+PONG\r\n");
    }
  });
});
server.listen(6379, "127.0.0.1");
