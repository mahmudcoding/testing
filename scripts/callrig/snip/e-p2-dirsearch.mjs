import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  const box = page.locator('input[type=search]').first();
  out.boxFound = await box.count();
  if(!out.boxFound) return out;
  const listed = `(() => { ${VISFN}
     const m=document.querySelector('main');
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     const names=(t.match(/QA [A-Z][a-z]+/g)||[]);
     return {names:[...new Set(names)], empty:/No people match/i.test(t)}; })()`;
  for(const q of ['Bob','bob','qa_e_bob','qa.e.bob@aloqa.test','BOB','Bo','xyzzy']){
    await box.fill('');
    await page.waitForTimeout(700);
    await box.fill(q);
    await page.waitForTimeout(2200);
    out[q] = await page.evaluate(listed);
  }
  return out;
};
