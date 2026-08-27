import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/e413bd47-3211-4b38-a986-f622cf2d708c/scratchpad/upl';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const clear = async () => { await comp.click(); await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.press('Backspace'); await page.waitForTimeout(400); };
  // case A: text + one file
  await clear();
  await page.locator('input[type=file]').first().setInputFiles([DIR+'/seam-a.txt']);
  await page.waitForTimeout(3500);
  await comp.click(); await page.keyboard.type('caption for the attachment');
  await page.waitForTimeout(600); await page.keyboard.press('Enter');
  await page.waitForTimeout(7000);
  // case B: two files, no text
  await clear();
  await page.locator('input[type=file]').first().setInputFiles([DIR+'/seam-a.txt', DIR+'/seam-b.txt']);
  await page.waitForTimeout(4500);
  await comp.click(); await page.keyboard.press('Enter');
  await page.waitForTimeout(8000);
  out.tail = await page.evaluate(`(() => { ${VISFN}
     const msgs=[...document.querySelectorAll('[data-message-id]')].filter(vis);
     return msgs.slice(-3).map(m=>(m.innerText||'').replace(/\\s+/g,' ').slice(0,110)); })()`);
  return out;
};
