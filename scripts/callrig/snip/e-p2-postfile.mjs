import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/e413bd47-3211-4b38-a986-f622cf2d708c/scratchpad/upl';
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('response', async r=>{ const u=r.url(); const m=r.request().method();
    if(/messages|upload/.test(u)&&m==='POST'){ let b=''; try{b=(await r.text()).slice(0,150);}catch(e){}
      posts.push(r.status()+' '+m+' '+u.split('/api/v1/')[1]?.slice(0,40)+' :: '+b.replace(/\s+/g,' ')); }});
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const inputs = await page.locator('input[type=file]').count();
  out.fileInputs = inputs;
  if(inputs){ await page.locator('input[type=file]').first().setInputFiles([DIR+'/seam-probe.txt']); }
  await page.waitForTimeout(4500);
  out.composerState = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\\s+/g,' ');
     return t.slice(-200); })()`);
  // clear composer then send
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(7000);
  out.posts = posts.slice(0,3);
  out.tail = await page.evaluate(`(() => { ${VISFN}
     const msgs=[...document.querySelectorAll('[data-message-id]')].filter(vis);
     return msgs.length? {n:msgs.length, last:(msgs[msgs.length-1].innerText||'').replace(/\\s+/g,' ').slice(0,140)}:null; })()`);
  return out;
};
