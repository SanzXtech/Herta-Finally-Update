//axios@0.20.0  "^0.27.2",

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Global filter untuk menyembunyikan log spam dari Baileys/libsignal
const filterPatterns = [
  'Closing open session', 'Closing session', 'SessionEntry', 'pendingPreKey',
  '_chains:', 'currentRatchet:', 'ephemeralKeyPair:', '<Buffer', 'indexInfo:',
  'registrationId:', 'chainKey:', 'rootKey:', 'baseKey:', 'remoteIdentityKey:',
  'previousCounter:', 'chainType:', 'messageKeys:', 'pubKey:', 'privKey:',
  'lastRemoteEphemeralKey:', 'baseKeyType:', 'closed:', 'used:', 'created:',
  'Caught exception:', 'AxiosError:', 'socket hang up', 'ECONNRESET',
  '_writableState:', '_events:', '_options:', 'transitional:', 'Symbol(',
  '_currentRequest:', '_header:', 'highWaterMark:', '[cause]:', 'Session error',
  'Failed to decrypt message', 'Failed to decrypt', 'Bad MAC', 'Bad MAC Error',
  '{}', 'config:', 'request:', 'adapter:',
  'transformRequest:', 'transformResponse:', 'xsrfCookieName:', 'validateStatus:',
  'env:', 'headers:', 'Object [AxiosHeaders]', 'responseType:', 'method:',
  'url:', 'allowAbsoluteUrls:', 'data: undefined', '_maxListeners:', 'corked:',
  'onwrite:', 'writelen:', 'bufferedIndex:', 'pendingcb:', '_ended:', '_ending:',
  '_redirectCount:', '_redirects:', '_requestBodyLength:', '_eventsCount:',
  '_onNativeResponse:', '_currentUrl:', '_timeout:', 'maxRedirects:', 'protocol:',
  'path:', 'agents:', 'auth:', 'family:', 'beforeRedirect:', 'hostname:', 'port:',
  'agent:', 'nativeProtocols:', 'pathname:', 'outputData:', 'outputSize:',
  'writable:', 'destroyed:', 'chunkedEncoding:', 'shouldKeepAlive:', 'sendDate:',
  '_removedConnection:', '_contentLength:', '_hasBody:', '_trailer:', 'finished:',
  '_headerSent:', '_closed:', '_keepAliveTimeout:', 'socketPath:', 'maxHeaderSize:',
  'insecureHTTPParser:', 'aborted:', 'timeoutCb:', 'upgradeOrConnect:', 'parser:',
  'maxHeadersCount:', 'reusedSocket:', 'host:', '_redirectable:', 'code:',
  'doDecryptWhisperMessage', 'decryptWithSessions', 'session_cipher.js',
  '_asyncQueueExecutor', 'queue_job.js', 'libsignal/src', 'verifyMAC',
  'crypto.js:87', 'at Object.verifyMAC', 'at SessionCipher', 'at async SessionCipher',
  'at async _asyncQueueExecutor', 'in favor of incoming prekey', 'prekey bundle',
  'Total file sesi', 'Terdeteksi', 'file sampah', 'Anti Spam Case', 'signedKeyId', 'preKeyId'
];
const origLog = console.log;
const origError = console.error;

// Deep inspection untuk object
const utilInspect = require('util').inspect;
const chalkModule = require('chalk');

// Filter function - dengan deep inspection
const shouldFilter = (args) => {
  try {
    const str = args.map(a => {
      if (typeof a === 'string') return a;
      if (a === null || a === undefined) return '';
      if (typeof a === 'object') {
        try {
          return utilInspect(a, { depth: 3, maxStringLength: 1000 });
        } catch (e) {
          return String(a);
        }
      }
      return String(a);
    }).join(' ');
    for (const p of filterPatterns) if (str.includes(p)) return true;
  } catch (e) {}
  return false;
};

console.log = (...args) => {
  // Filter object SessionEntry langsung
  for (const arg of args) {
    if (arg && typeof arg === 'object') {
      if (arg.constructor && arg.constructor.name === 'SessionEntry') return;
      if (arg._chains || arg.currentRatchet || arg.indexInfo || arg.registrationId) return;
    }
  }
  if (shouldFilter(args)) return;
  // Suppress noisy internal debug messages
  const str = args.map(a => typeof a === 'string' ? a : String(a)).join(' ');
  const suppress = [
    'Skipping system participant',
    'Received @lid event',
    'handleWelcomeLeave called',
    'Processing action:',
    '[GRUP UPDATE]',
    'bot is not admin according'
  ];
  for (const s of suppress) if (str.includes(s)) return;

  // If the line contains GROUP or PRIVATE, color it cyan (not red)
  if (/\bGROUP\b|\bPRIVATE\b/i.test(str)) return origLog.call(console, chalkModule.cyan(str));

  // Color generic ERROR lines red (but not session errors)
  if (/\bERROR\b|\bError\b/.test(str) && !shouldFilter(args)) return origLog.call(console, chalkModule.red(str));

  origLog.apply(console, args);
};

// Also filter console.error
console.error = (...args) => {
  // Filter object SessionEntry langsung
  for (const arg of args) {
    if (arg && typeof arg === 'object') {
      if (arg.constructor && arg.constructor.name === 'SessionEntry') return;
      if (arg._chains || arg.currentRatchet || arg.indexInfo || arg.registrationId) return;
    }
  }
  if (shouldFilter(args)) return;
  origError.apply(console, args);
};


import chalk from "chalk";
import axios from "axios";
import { fileURLToPath, URL } from "url";
import cluster from "cluster";
import { join, dirname } from "path";
import fs from 'fs-extra'
import Readline from "readline";
import { config } from 'dotenv';
import express from "express";

const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};


const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const rl = Readline.createInterface(process.stdin, process.stdout);
const PORT = process.env.PORT || 4000
const HOST = '0.0.0.0';

app.all('/', (req, res) => {
  let html = fs.readFileSync('./index.html', 'utf-8')
  res.end(html)
})

app.listen(PORT,HOST, () => {
console.log(chalk.green(`🌐 Port ${PORT} is open`));
console.log(chalk.green(`🌐 Keep Alive on`));
});

config();



var error = 0 

var isRunning = false;
/**
* Start a js file
* @param {String} file `path/to/file`
*/
function start(file) {
if (isRunning) return;
isRunning = true;
let args = [join(__dirname, file), ...process.argv.slice(2)];

cluster.setupMaster({
exec: join(__dirname, file),
args: args.slice(1),
});
let p = cluster.fork();
p.on("message",async (data) => {
//console.log("[RECEIVED]", data);
switch (data) {
case "reset":
console.log("saatnya reset");
p.process.kill();
isRunning = false;
start.apply(this, arguments);
break;
case "null":
p.process.kill();
isRunning = false;
start.apply(this, arguments);
    console.log(chalk.yellowBright.bold(`System error total: ${error}`))
break;
case "SIGKILL":
p.process.kill();
isRunning = false;
start.apply(this, arguments);
break;
case "uptime":
p.send(process.uptime());
break;
}
});

//exit
p.on("exit", async (_, code) => {
console.error(chalk.red(`🛑 Exited with code: ${code}`));
console.error(chalk.red(`❌ Script will restart...`));

if(error > 4) {
console.log(chalk.yellowBright.bold(`Terjadi error lebih dari ${error} kali, system di hentikan selama satu jam`))
  
setInterval( async () => {
error = 0
  p.process.kill();
  isRunning = false;
  start.apply(this, arguments);
console.log(chalk.yellowBright.bold(`System error telah di reset, total system error ${error}`))
},  60000 * 60);

} else if(error < 5) {

  
setInterval( async () => {
error = 0
}, 60000 * 5);

  
  
if (code == null) {
//await sleep(10000) 
error += 1
p.process.kill();
isRunning = false;
start.apply(this, arguments);
console.log(chalk.yellowBright.bold(`System error total: ${error}`))
} else if (code == "SIGKILL") {
p.process.kill();
isRunning = false;
start.apply(this, arguments);
} else  if (code == "SIGBUS") {
p.process.kill();
isRunning = false;
start.apply(this, arguments);
} else  if (code == "SIGABRT") {
p.process.kill();
isRunning = false;
start.apply(this, arguments);
} else  if (code === 0) {
//await sleep(10000) 
error += 1
p.process.kill();
isRunning = false;
start.apply(this, arguments);
console.log(chalk.yellowBright.bold(`System error total: ${error}`))
}

}// akhir dari error < 5

  
isRunning = false;

/*
fs.watchFile(args[0], () => {
fs.unwatchFile(args[0]);
start(file);
});

if (!rl.listenerCount())
rl.on("line", (line) => {
p.emit("message", line.trim());
});
  */
});

//unhandledRejection
p.on("unhandledRejection", async () => {
console.error(
chalk.red(`❌ Unhandled promise rejection. Script will restart...`)
);
await sleep(10000)
  error += 1
p.process.kill();
isRunning = false;
start.apply(this, arguments);
  console.log(chalk.yellowBright.bold(`System error total: ${error}`))
});

//error
p.on("error", async (err) => {
console.error(chalk.red(`❌ Error: ${err}`));
await sleep(10000) 
  error += 1
p.process.kill();
isRunning = false;
start.apply(this, arguments);
});

}

start("main.js");
//start("test.js");






//KEEP ALIVE
function keepAlive() {
const url = `https://a7189f57-1f15-4060-b97e-853222c15d2e-00-uy10zij1nl6y.teams.replit.dev`;
if (/(\/\/|\.)undefined\./.test(url)) return;
setInterval( async () => {
//console.log('pinging...')
//fetch(url).catch(console.error);

 let response = await axios(url)
if(error < 5) console.log(chalk.yellowBright.bold('Server wake-up! --', response.status))
  
},  1000 * 60);
}
