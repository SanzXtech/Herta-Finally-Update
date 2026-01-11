//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

// Filter untuk menyembunyikan log yang tidak penting dari Baileys
const filterPatterns = [
  'Closing open session',
  'Closing session:',
  'SessionEntry',
  'pendingPreKey',
  '_chains:',
  'currentRatchet:',
  'ephemeralKeyPair:',
  '<Buffer',
  'indexInfo:',
  'registrationId:',
  'chainKey:',
  'rootKey:',
  'baseKey:',
  'remoteIdentityKey:',
  'previousCounter:',
  'chainType:',
  'messageKeys:',
  'pubKey:',
  'privKey:',
  'lastRemoteEphemeralKey:',
  'baseKeyType:',
  'closed:',
  'used:',
  'created:',
  'Caught exception:',
  'AxiosError:',
  'socket hang up',
  'ECONNRESET',
  '_writableState:',
  '_events:',
  '_options:',
  'transitional:',
  'Symbol(',
  '_currentRequest:',
  '_header:',
  'highWaterMark:',
  '[cause]:',
  'Session error:',
  'Session error:Error',
  'Failed to decrypt message',
  'Failed to decrypt',
  'Bad MAC',
  'Bad MAC Error',
  '{}',
  'doDecryptWhisperMessage',
  'decryptWithSessions',
  'session_cipher.js',
  '_asyncQueueExecutor',
  'queue_job.js',
  'libsignal/src',
  'verifyMAC',
  'crypto.js:87',
  'at Object.verifyMAC',
  'at SessionCipher',
  'at async SessionCipher',
  'at async _asyncQueueExecutor',
  'in favor of incoming prekey',
  'Closing open session in favor',
  'Total file sesi',
  'Terdeteksi',
  'file sampah',
  'Anti Spam Case'
];

// Filter function - lebih agresif dengan deep inspection
const utilInspect = require('util').inspect;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

const shouldFilter = (args) => {
  try {
    // Convert semua args ke string termasuk objects
    const str = args.map(a => {
      if (typeof a === 'string') return a;
      if (a === null || a === undefined) return '';
      if (typeof a === 'object') {
        try {
          return utilInspect(a, { depth: 2, maxStringLength: 500 });
        } catch (e) {
          return String(a);
        }
      }
      return String(a);
    }).join(' ');
    
    for (const p of filterPatterns) {
      if (str.includes(p)) return true;
    }
  } catch (e) {}
  return false;
};

console.log = (...args) => {
  if (shouldFilter(args)) return;
  originalConsoleLog.apply(console, args);
};

console.error = (...args) => {
  if (shouldFilter(args)) return;
  originalConsoleError.apply(console, args);
};
import "./settings.js";

const {

  makeInMemoryStore,

  useMultiFileAuthState,

  makeCacheableSignalKeyStore,

  MessageRetryMap,

  fetchLatestBaileysVersion,

  PHONENUMBER_MCC,

  getAggregateVotesInPollMessage

} = await import("baileys");

import fs, { readdirSync, existsSync, readFileSync, watch, statSync } from "fs";

import logg from "pino";

import { Socket, smsg, protoType } from "./lib/simple.js";

import CFonts from "cfonts";

import path, { join, dirname, basename } from "path";

import { memberUpdate, groupsUpdate } from "./message/group.js";

import { antiCall } from "./message/anticall.js";

import { connectionUpdate } from "./message/connection.js";

import { Function } from "./message/function.js";

import NodeCache from "node-cache";

import { createRequire } from "module";

import { fileURLToPath, pathToFileURL } from "url";

import { platform } from "process";

import syntaxerror from "syntax-error";

import { format } from "util";

import chokidar from "chokidar";

import chalk from "chalk";

import util from "util";

const { proto, generateWAMessage,  areJidsSameUser } = require('baileys')

const __dirname = dirname(fileURLToPath(import.meta.url));

global.__filename = function filename(

  pathURL = import.meta.url,

  rmPrefix = platform !== "win32"

) {

  return rmPrefix

    ? /file:\/\/\//.test(pathURL)

      ? fileURLToPath(pathURL)

      : pathURL

    : pathToFileURL(pathURL).toString();

};

/*

global.__dirname = function dirname(pathURL) {

return path.dirname(global.__filename(pathURL, true))

};

*/

global.__require = function require(dir = import.meta.url) {

  return createRequire(dir);

};

protoType();

let phoneNumber = "916909137213";

const readline = require("readline");

const rl = readline.createInterface({

  input: process.stdin,

  output: process.stdout,

});

const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const pairingCode = false; // process.argv.includes("--pairing-code");

const useMobile = process.argv.includes("--mobile");

const msgRetryCounterCache = new NodeCache();

// Cache untuk mencegah double processing pesan (TTL 10 detik saja)
const processedMessagesCache = new NodeCache({ stdTTL: 10, checkperiod: 5 });

const msgRetryCounterMap = (MessageRetryMap) => {};

CFonts.say("fearless", {

  font: "chrome",

  align: "left",

  gradient: ["red", "magenta"],

});

//Connect to WhatsApp

const connectToWhatsApp = async () => {

  await (await import("./message/database.js")).default();

  //const { state } = useSingleFileAuthState('./session.json')

  const { state, saveCreds } = await useMultiFileAuthState(session);

  const store = (typeof makeInMemoryStore === 'function') ? makeInMemoryStore({

    logger: logg().child({ level: "fatal", stream: "store" }),

  }) : (function(){
    const st = {
      chats: new Map(),
      contacts: {},
      messages: {},
      bind: ()=>{},
      readFromFile: ()=>{},
      writeToFile: ()=>{},
      loadMessage: async ()=> undefined,
      all: ()=> []
    };
    return st;
  })();

  const { version, isLatest } = await fetchLatestBaileysVersion();

  //Funtion agar pesan bot tidak pending

  const getMessage = async (key) => {

    if (store) {

      const msg = await store.loadMessage(key.remoteJid, key.id, undefined);

      return msg?.message || undefined;

    }

    // only if store is present

    return proto.Message.fromObject({});

  };

  //Untuk menyimpan session

  const auth = {

    creds: state.creds,

    /** caching makes the store faster to send/recv messages */

    keys: makeCacheableSignalKeyStore(

      state.keys,

      logg().child({ level: "fatal", stream: "store" })

    ),

  };

  //Funtion agar bisa pake button di bailey terbaru

  const patchMessageBeforeSending = (message) => {

    const requiresPatch = !!(

      message.buttonsMessage ||

      message.listMessage ||

      message.templateMessage

    );

    if (requiresPatch) {

      message = {

        viewOnceMessage: {

          message: {

            messageContextInfo: {

              deviceListMetadataVersion: 2,

              deviceListMetadata: {},

            },

            ...message,

          },

        },

      };

    }

    return message;

  };

  //Koneksi nih silakan di isi

  const connectionOptions = {

    version,

    printQRInTerminal: !global.pairingCode,

    patchMessageBeforeSending,

    logger: logg({ level: "fatal" }),

    auth,

    browser: ["Ubuntu","Chrome"],

    //browser: ["Chrome (Linux)", "", ""], //['Mac OS', 'chrome', '121.0.6167.159'], //  for this issues https://github.com/WhiskeySockets/Baileys/issues/328

    getMessage,

    MessageRetryMap,

    keepAliveIntervalMs: 20000,

    defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276

    connectTimeoutMs: 30000,

    emitOwnEvents: true,

    fireInitQueries: false, // Disable initial queries to speed up connection

    generateHighQualityLinkPreview: false, // Disable untuk speed

    syncFullHistory: false, // Disable history sync untuk respon lebih cepat

    markOnlineOnConnect: true,

    msgRetryCounterCache,

  };

  global.conn = Socket(connectionOptions);

  //!global.pairingCode &&

  store.bind(conn.ev);

  if (global.pairingCode && !conn.authState.creds.registered) {

/*

    //const folderPath = './folder-yang-akan-dihapus';

    if (fs.existsSync(`./${global.session}`)) {

    // Menggunakan fs.rm

    fs.rm(global.session, { recursive: true, force: true }, (err) => {

      if (err) {

        console.error('Error saat menghapus folder:', err);

      } else {

        console.log('Membersihkan Folder Session');

      }

    });

  } 

*/

 

    setTimeout(async () => {

      let code = await conn.requestPairingCode(global.nomerBot);

      code = code?.match(/.{1,4}/g)?.join("-") || code;

      console.log(

        chalk.black(chalk.bgGreen(`Your Phone Number : `)),

        chalk.black(chalk.white(global.nomerBot)),

        chalk.black(chalk.bgGreen(`\nYour Pairing Code : `)),

        chalk.black(chalk.white(code))

      );

    }, 3000);

  }

  

 

  conn.ev.on("connection.update", async (update) => {
    if (db.data == null) await loadDatabase();
    await connectionUpdate(connectToWhatsApp, conn, update);
  });

  conn.ev.on("creds.update", saveCreds);

  // Pre-load modules untuk menghindari dynamic import yang lambat
  const registerModule = await import('./message/register.js');
  const handlerModule = await import('./handler.js');

  // Gunakan ev.process untuk menghindari event buffering
  conn.ev.process(async (events) => {
    // received a new message
    if (events["messages.upsert"]) {
      const chatUpdate = events["messages.upsert"];
      try {
        // Proses pesan baru dan juga backlog ('append') agar pesan yang dikirim selama idle tetap tertangani
        if (!['notify','append'].includes(chatUpdate.type)) return;

        if (!chatUpdate.messages) return;



        // Proses setiap pesan
        for (const m of chatUpdate.messages) {
          try {
            if (!m) continue;

            if (m.key.fromMe) continue;

            // Cek apakah pesan sudah pernah diproses
            const msgId = m.key.id;
            if (msgId && processedMessagesCache.has(msgId)) continue;

            // Handle viewOnce and documentWithCaption messages
            try {
              if (m.message?.viewOnceMessageV2) m.message = m.message.viewOnceMessageV2.message;
              if (m.message?.documentWithCaptionMessage) m.message = m.message.documentWithCaptionMessage.message;
              if (m.message?.viewOnceMessageV2Extension) m.message = m.message.viewOnceMessageV2Extension.message;
            } catch (e) {}

            if (m.key && m.key.remoteJid === 'status@broadcast') continue;
            if (!m.message) continue;

            // Filter pesan internal baileys (lebih selektif)
            const isBaileysInternal = m.key.id && (
              // Pesan internal biasanya mengandung protocolMessage atau senderKeyDistributionMessage
              !!m.message?.protocolMessage || !!m.message?.senderKeyDistributionMessage || !!m.message?.messageStubType ||
              // Tetap tangkis beberapa pola id yang diketahui, tapi jangan skip jika pesan berisi media/interactive
              ((m.key.id.startsWith('3EB0') && m.key.id.length === 12))
            );
            if (isBaileysInternal) continue;

            let msg = await smsg(conn, m);

            if (msg.messageStubParameters && msg.messageStubParameters[0] === "Message absent from node") {
              conn.sendMessageAck(JSON.parse(msg.messageStubParameters[1], BufferJSON.reviver));
            }

            await registerModule.register(msg);
            await handlerModule.handler(conn, msg, chatUpdate, store);
            if (global.db && global.db.data) try { global.db.write(); } catch (e) { console.error('Failed to write database:', e); }

          } catch (err) {
            console.log('[ERROR]', err.message || err);
          }
        }
      } catch(err) {
        console.log('[ERROR]', err.message || err);
      }
    }

    // Handle call events
    if (events.call) {
      antiCall(db, events.call, conn);
    }

    // Handle group participants update
    if (events["group-participants.update"]) {
      if (global.db.data == null) await loadDatabase();
      memberUpdate(conn, events["group-participants.update"]);
    }
  });

  global.reloadHandler = async function (restatConn) {};

  const pluginFolder = path.join(__dirname, "./plugins");

  // Periodic check: verify Elaina Baileys npm version vs installed and warn if newer
  const { exec } = await import('child_process');
  async function checkBaileysUpdates() {
    try {
      exec('npm view @rexxhayanasi/elaina-baileys version', (err, stdout) => {
        if (err) return console.error('Baileys update check failed', err.message);
        const latest = stdout.trim();
        const installed = (require('./package.json').dependencies || {}).baileys || '';
        if (installed && installed.includes(latest)) {
          console.log('Elaina Baileys is up-to-date:', latest);
        } else {
          console.log('Elaina Baileys update available:', { installed, latest });
        }
      });
    } catch (e) {
      console.error('checkBaileysUpdates error', e.message);
    }
  }
  checkBaileysUpdates();
  setInterval(checkBaileysUpdates, 1000 * 60 * 60 * 24); // check daily


  const pluginFilter = (filename) => /\.js$/.test(filename);

  global.plugins = {};

  async function filesInit(folderPath) {

    const files = readdirSync(folderPath);

    for (let file of files) {

      const filePath = join(folderPath, file);

      const fileStat = statSync(filePath);

      if (fileStat.isDirectory()) {

        // Jika file adalah sebuah direktori, panggil kembali fungsi filesInit dengan folder baru sebagai parameter

        await filesInit(filePath);

      } else if (pluginFilter(file)) {

        // Jika file adalah file JavaScript, lakukan inisialisasi

        try {

          const module = await import("file://" + filePath);

          global.plugins[file] = module.default || module;

        } catch (e) {

          conn.logger.error(e);

          delete global.plugins[file];

        }

      }

    }

  }

  filesInit(pluginFolder);

  global.reload = async (_ev, filename) => {

    //console.log(filename)

    if (pluginFilter(filename)) {

      let dir = global.__filename(join(filename), true); //pluginFolder,

      if (filename in global.plugins) {

        if (existsSync(dir))

          console.log(

            chalk.bgGreen(chalk.black("[ UPDATE ]")),

            chalk.white(`${filename}`)

          );

        // conn.logger.info(`re - require plugin '${filename}'`);

        else {

          conn.logger.warn(`deleted plugin '${filename}'`);

          return delete global.plugins[filename];

        }

      } else

        console.log(

          chalk.bgGreen(chalk.black("[ UPDATE ]")),

          chalk.white(`${filename}`)

        ); //;conn.logger.info(`requiring new plugin '${filename}'`);

      //console.log(dir)

      let err = syntaxerror(readFileSync(dir), filename, {

        sourceType: "module",

        allowAwaitOutsideFunction: true,

      });

      if (err)

        conn.logger.error(

          `syntax error while loading '${filename}'\n${format(err)}`

        );

      else

        try {

          const module = await import(

            `${global.__filename(dir)}?update=${Date.now()}`

          );

          global.plugins[filename] = module.default || module;

        } catch (e) {

          conn.logger.error(`error require plugin '${filename}\n${format(e)}'`);

        } finally {

          global.plugins = Object.fromEntries(

            Object.entries(global.plugins).sort(([a], [b]) =>

              a.localeCompare(b)

            )

          );

        }

    }

  };

  // Buat instance Chokidar watcher

  const watcher = chokidar.watch(pluginFolder, {

    ignored: /(^|[\/\\])\../, // ignore dotfiles

    persistent: true,

    depth: 99, // Tentukan kedalaman rekursi

    awaitWriteFinish: {

      stabilityThreshold: 2000,

      pollInterval: 100,

    },

  });

  // Tambahkan event listener untuk memantau perubahan

  watcher.on("all", (event, path) => {

    // Panggil fungsi reload jika file yang berubah adalah file JavaScript

    if (event === "change" && path.endsWith(".js")) {

      const filename = path.split("/").pop(); // Dapatkan nama file dari path

      global.reload(null, filename); // Panggil fungsi reload dengan null untuk _ev dan nama file

    }

  });

  Object.freeze(global.reload);

  watch(pluginFolder, global.reload);

  //await global.reloadHandler()

  Function(conn);

  return conn;

};

connectToWhatsApp();

process.on("uncaughtException", function (err) {

  let e = String(err);

  if (e.includes("Socket connection timeout")) return;

  if (e.includes("rate-overlimit")) return;

  if (e.includes("Connection Closed")) return;

  if (e.includes("Timed Out")) return;

  if (e.includes("Value not found")) return;

  console.log("Caught exception: ", err);

});

process.on("warning", (warning) => {

  console.warn(warning.name); // Cetak nama peringatan

  console.warn(warning.message); // Cetak pesan peringatan

  console.warn(warning.stack); // Cetak stack trace

});
