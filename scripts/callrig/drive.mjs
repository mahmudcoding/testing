// Connect to a rig Chrome over CDP and run a snippet file against its page.
//   usage: node drive.mjs <port> <snippet.mjs>
// snippet.mjs must `export default async ({page, ctx, browser}) => any`
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const port = process.argv[2];
const file = path.resolve(process.argv[3]);
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const ctx = browser.contexts()[0];
const { HOOK } = await import(pathToFileURL(path.resolve('snip/lib.mjs')).href);
await ctx.addInitScript(HOOK);
const all = ctx.pages().filter(p => !p.url().startsWith('devtools://'));
const pages = all.filter(p => p.url().includes('airion-cargo.store'));
const page = pages[0] || all[all.length-1] || await ctx.newPage();
if (process.env.QA_LISTPAGES) console.log('PAGES: ' + JSON.stringify(all.map(p=>p.url())));
try {
  const mod = await import(pathToFileURL(file).href);
  const res = await mod.default({ page, ctx, browser, pages });
  console.log(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
} catch (e) {
  console.log('DRIVE-ERROR: ' + (e && e.stack || e));
  process.exit(2);
}
process.exit(0);
