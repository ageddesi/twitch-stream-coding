import tmi from "tmi.js";

export default new tmi.Client({
  options: { debug: true },
  connection: {
    secure: true,
    reconnect: true,
  },
  identity: {
    username: "litteheroesspark",
    password: "oauth:booidmz2jh19ovuf3l804mv9lyk11m",
  },
  channels: ["littleheroesspark"],
});
