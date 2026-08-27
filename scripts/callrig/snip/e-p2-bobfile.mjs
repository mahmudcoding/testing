import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/e413bd47-3211-4b38-a986-f622cf2d708c/scratchpad/upl';
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('response', async r=>{ const u=r.url();
    if(/upload|messages/.test(u)&&r.request().method()==='POST'){ let b=''; try{b=(await r.text()).slice(0,110);}catch(e){}
      posts.push(r.status()+' '+u.split('/api/v1/')[1].slice(0,26)+' :: '+b.replace(/\s+/g,' ')); }});
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const n = await page.locator('input[type=file]').count();
  out.inputs=n;
  if(n){ await page.locator('input[type=file]').first().setInputFiles([DIR+'/bob-shared.txt']); }
  await page.waitForTimeout(4500);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(7000);
  out.posts = posts.slice(0,2);
  return out;
};
