import clc from "cli-color";

type Colors = "yellow" | "red" | "green";

export class Logger {
  log(msg: string, color?: Colors) {
    const now = new Date();
    const str = `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}]  ${msg}`;

    color ? console.log(clc[color](str)) : console.log(str);
  }

  brush(msg: string, color: Colors) {
    return clc[color](msg);
  }
}