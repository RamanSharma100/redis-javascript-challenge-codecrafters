const net = require("net");

console.log("Logs from your program will appear here!!");

const TOTAL_DBS = 20;
const DEFAULT_DB = 0;
const MAX_KEY_SIZE = 512;
const MAX_VALUE_SIZE = 1024 * 1024 * 1024;

const storage = Array.from({ length: TOTAL_DBS }, () => new Map());

const server = net.createServer((connection) => {
  connection.on("data", (data) => {
    const commands = data.toString().trim().split("\r\n");
    console.log(commands);
    console.log(commands[2]);
    if (commands[2].toUpperCase() === "PING") {
      connection.write("+PONG\r\n");
    }

    if (commands[2].toUpperCase() === "ECHO") {
      connection.write(`$${commands[4].length}\r\n${commands[4]}\r\n`);
    }

    if (commands[2].toUpperCase() === "SET") {
      if (commands[4].length > MAX_KEY_SIZE) {
        connection.write("-ERR key is too long\r\n");
        return;
      }

      if (commands[6].length > MAX_VALUE_SIZE) {
        connection.write("-ERR value is too long\r\n");
        return;
      }

      storage[DEFAULT_DB].set(commands[4], commands[6]);
      let exp_time;
      for (let i = 8; i < commands.length; i++) {
        if (commands[i].toUpperCase() === "EX") {
          exp_time = Date.now() + parseInt(command[i + 2]) * 1000;
        } else if (commands[i].toUpperCase() === "PX") {
          exp_time = Date.now() + parseInt(commands[i + 2]);
        }
      }

      if (exp_time) {
        storage[DEFAULT_DB].set(commands[4] + "_expire", exp_time);
      }

      console.log(storage);
      connection.write("+OK\r\n");
    }

    if (commands[2].toUpperCase() === "GET") {
      if (storage[DEFAULT_DB].has(commands[4])) {
        if (
          storage[DEFAULT_DB].has(commands[4] + "_expire") &&
          storage[DEFAULT_DB].get(commands[4] + "_expire") < Date.now()
        ) {
          storage[DEFAULT_DB].delete(commands[4]);
          storage[DEFAULT_DB].delete(commands[4] + "_expire");
          connection.write("$-1\r\n");
          return;
        }

        storage[DEFAULT_DB].get(commands[4]);
        connection.write(
          `$${storage[DEFAULT_DB].get(commands[4]).length}\r\n${storage[
            DEFAULT_DB
          ].get(commands[4])}\r\n`
        );
      } else {
        connection.write("$-1\r\n");
      }
    }
  });
});
server.listen(6379, "127.0.0.1");
