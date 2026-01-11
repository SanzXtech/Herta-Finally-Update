import chalk from "chalk";
import moment from "moment-timezone";
import fs from 'fs-extra'
import _spam from "../../lib/antispam.js";

// Konstanta untuk menentukan metode pencatatan pesan

// Warna dengan border tebal seperti INFO/WARNING
const label = {
  group: chalk.bgHex("#8B5CF6").bold.white(" GROUP "),
  private: chalk.bgCyan.bold.black(" PRIVATE "),
  command: chalk.bgYellow.bold.black(" COMMAND "),
  sistem: chalk.bgRed.bold.white(" SISTEM "),
  error: chalk.bgRed.bold.white(" ERROR ")
};

const colors = {
  violet: chalk.hex("#8B5CF6"),
  cyan: chalk.hex("#00FFFF"),
  white: chalk.white,
  gray: chalk.gray,
  red: chalk.red
};

//Log text di group dan private chat
export const message = async (conn, m, budy, AntiSpam) => {
  if (budy && m.key.remoteJid !== "status@broadcast") {
    const timeStr = moment.tz("Asia/Jakarta").format("HH:mm");
    const msgPreview = budy.length > 50 ? budy.substring(0, 50) + '...' : budy;
    
    if (print) {
      console.log(
        m.isGroup ? label.group : label.private,
        colors.gray(`[${timeStr}]`),
        m.isGroup ? colors.violet(msgPreview) : colors.cyan(msgPreview),
        colors.white("~"),
        m.isGroup ? colors.violet(m.pushname) : colors.cyan(m.pushname),
        m.isGroup ? colors.gray(`@ ${m.groupName}`) : ""
      );
    } else {
      console.log(
        m.isGroup ? "[GROUP]" : "[PRIVATE]",
        `[${timeStr}]`,
        msgPreview,
        "~",
        m.pushname,
        m.isGroup ? `@ ${m.groupName}` : ""
      );
    }
    console.log(colors.gray(`         ${m.senderNumber}`));
  }
};

function readLogs() {
  try {
    const data = fs.readFileSync('./database/logs.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return []
  }
}

function saveUserData(data,obj) {
  if(data.length > 10) data.length = 0
  data.push(obj);
  const oke = JSON.stringify(data, null, 2);
  fs.writeFileSync('./database/logs.json', oke);
}

//Log command bot
export const commands = async (m, command, q, isCmd) => {
  if(isCmd) {
    const timeStr = moment.tz("Asia/Jakarta").format("HH:mm");
    const cmdText = q ? `${command} ${q}` : command;
    
    if (print) {
      console.log(
        label.command,
        colors.gray(`[${timeStr}]`),
        colors.white(cmdText),
        colors.white("~"),
        m.isGroup ? colors.violet(m.pushname) : colors.cyan(m.pushname),
        m.isGroup ? colors.gray(`@ ${m.groupName}`) : ""
      );
    } else {
      console.log(
        "[COMMAND]",
        `[${timeStr}]`,
        cmdText,
        "~",
        m.pushname,
        m.isGroup ? `@ ${m.groupName}` : ""
      );
    }
    console.log(colors.gray(`         ${m.senderNumber}`));
  }
  let data = readLogs()

  let obj = {
    name: m.pushname,
    command: command,
    query: q,
    time: moment.tz("Asia/Jakarta").format("HH:mm:ss"),
    number: m.senderNumber,
    group: m.isGroup ? m.groupName : 'Private chat'
  }

  saveUserData(data, obj)
};

//Log error
export const error = async (m, command) => {
  const timeStr = moment.tz("Asia/Jakarta").format("HH:mm");
  console.log(
    label.error,
    colors.gray(`[${timeStr}]`),
    colors.red(`${command} [${m.args.length}]`),
    colors.white("~"),
    colors.cyan(m.pushname)
  );
};

//Log sistem
export const sistem = (message) => {
  const timeStr = moment.tz("Asia/Jakarta").format("HH:mm");
  console.log(
    label.sistem,
    colors.gray(`[${timeStr}]`),
    colors.red(message)
  );
};
