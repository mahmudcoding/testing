// Connect to a rig Chrome over CDP and run a snippet file against its page.
//   usage: node drive.mjs <port|lane:account> <snippet.mjs>
//     node drive.mjs 9222 snip/x.mjs        addresses a window by raw port
//     node drive.mjs b:alice snip/x.mjs     resolves lane B's alice -> port 9232
//
// Set QA_LANE=B and every call is guarded: if the browser on that port is signed
// in as an account from another lane, the run aborts instead of quietly driving
// a parallel session's window.
//
// snippet.mjs must `export default async ({page, ctx, browser, progress}) => any`
// call progress(n) as each of the finding's numbered steps completes
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { rigPort, laneOfEmail, laneOfPort } from './rigmap.mjs';

const target = process.argv[2];
let port = target;
if (!/^\d+$/.test(String(target))) {
  const [lane, account] = String(target).split(':');
  try { port = rigPort(lane, account); }
  catch (e) { console.log('DRIVE-ERROR: ' + e.message); process.exit(2); }
}

const file = path.resolve(process.argv[3]);
// QA_SLOW_MS paces every Playwright operation so a person can watch the run
// happen. Unset means 0, so nothing changes for an ordinary command-line run.
const slowMo = Number(process.env.QA_SLOW_MS || 0) || 0;
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { slowMo });
const ctx = browser.contexts()[0];
const { HOOK } = await import(pathToFileURL(path.resolve('snip/lib.mjs')).href);
await ctx.addInitScript(HOOK);
const all = ctx.pages().filter(p => !p.url().startsWith('devtools://'));
const pages = all.filter(p => p.url().includes('airion-cargo.store'));
const page = pages[0] || all[all.length-1] || await ctx.newPage();
if (process.env.QA_LISTPAGES) console.log('PAGES: ' + JSON.stringify(all.map(p=>p.url())));

// lane guard — refuse to drive a browser that belongs to another session
if (process.env.QA_LANE) {
  const want = process.env.QA_LANE.toUpperCase();
  const portLane = laneOfPort(port);
  if (portLane && portLane !== want) {
    console.log(`DRIVE-ERROR: lane guard — port ${port} belongs to lane ${portLane}, not ${want}. `
              + `Refusing to drive another session's browser.`);
    process.exit(3);
  }
  if (pages.length) {
    let email = null;
    try {
      email = await page.evaluate(async () => {
        try { return (await (await fetch('/api/v1/auth/me', {credentials:'include'})).json()).email; }
        catch { return null; }
      });
    } catch { /* page not ready — nothing signed in to protect */ }
    const seen = email && laneOfEmail(email);
    if (seen && seen.lane !== want) {
      console.log(`DRIVE-ERROR: lane guard — port ${port} is signed in as ${email} (lane ${seen.lane}), `
                + `but this session is lane ${want}. Refusing to drive it.`);
      process.exit(3);
    }
  }
}

try {
  const mod = await import(pathToFileURL(file).href);
  // progress(n): the snippet says it has finished the finding's step n. Printed
  // as a marker so anything watching stdout can tick it off while the run is
  // still going, instead of learning the whole story at the end.
  const progress = (n) => { console.log('@@STEP ' + Number(n)); };
  const res = await mod.default({ page, ctx, browser, pages, progress });
  console.log(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
} catch (e) {
  console.log('DRIVE-ERROR: ' + (e && e.stack || e));
  process.exit(2);
}
process.exit(0);
