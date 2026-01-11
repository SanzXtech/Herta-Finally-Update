import fs from "fs-extra";
import path from 'path';
import chalk from 'chalk';

async function autoClearSession() {
  try {
    const sessionPath = `./${global.session}`;
    if (!fs.existsSync(sessionPath)) return;

    const files = await fs.readdir(sessionPath);

    // Filter file sampah, kecuali creds.json dan sesi utama
    const filtered = files.filter((item) =>
      (item.startsWith("pre-key") || item.startsWith("sender-key") || item.startsWith("session-")) &&
      item !== "creds.json"
    );

    // Lightweight: first try to remove files older than configured days (cheap check)
    const now = Date.now();
    const ageLimit = (global.clearSessionDays || 7) * 24 * 60 * 60 * 1000;
    let removed = 0;

    for (let i = 0; i < filtered.length; i++) {
      const file = filtered[i];
      const fp = path.join(sessionPath, file);
      try {
        const s = await fs.stat(fp);
        if (now - s.mtimeMs > ageLimit) {
          await fs.unlink(fp);
          removed++;
        }
      } catch (err) {
        // ignore single file errors to keep checks light
      }
    }

    // Re-evaluate remaining 'trash' files
    const remaining = (await fs.readdir(sessionPath)).filter((item) =>
      (item.startsWith("pre-key") || item.startsWith("sender-key") || item.startsWith("session-")) &&
      item !== "creds.json"
    );

    const threshold = global.clearSessionThreshold || 300;
    const trimTo = global.clearSessionTrimTo || Math.floor(threshold * 0.66);

    // If remaining trash files exceed threshold, remove oldest ones until count <= trimTo
    if (remaining.length >= threshold) {
      // Build minimal metadata array (file + mtime) - unavoidable stat calls but only when trimming
      const filesWithTime = [];
      for (let i = 0; i < remaining.length; i++) {
        const file = remaining[i];
        const fp = path.join(sessionPath, file);
        try {
          const s = await fs.stat(fp);
          filesWithTime.push({ file, mtimeMs: s.mtimeMs });
        } catch (e) {
          // ignore
        }
      }
      // Sort ascending by mtime (oldest first)
      filesWithTime.sort((a, b) => a.mtimeMs - b.mtimeMs);
      const toRemoveCount = Math.max(0, remaining.length - trimTo);
      let removedTrim = 0;
      for (let i = 0; i < toRemoveCount; i++) {
        const fp = path.join(sessionPath, filesWithTime[i].file);
        try {
          await fs.unlink(fp);
          removedTrim++;
        } catch (e) {
          // ignore single file failures
        }
      }
      removed += removedTrim;
    }

    // Only log a concise message when actual removals happened to avoid noisy debug output
    if (removed > 0) console.log(chalk.yellow(`[CLEANUP] Removed ${removed} session file(s)`));
  } catch (err) {
    // Log rare fatal errors (keeps noise low)
    console.error("Terjadi kesalahan saat scan folder session:", err.message);
  }
}

// Interval cek berdasarkan pengaturan global (default 24 jam)
setInterval(() => autoClearSession(), (global.clearSessionIntervalHours || 24) * 60 * 60 * 1000);
// Jalankan sekali saat plugin dimuat agar pembersihan awal terjadi
setImmediate(() => autoClearSession());
