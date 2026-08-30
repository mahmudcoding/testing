import { DOM } from './lib.mjs';
// Open Add to call, try to select QA_TRY (banned) and QA_CTRL (control), report Invite(N) each time.
export default async ({page}) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const b = await page.$('button[aria-label="Add to call"]');
  const bb = await b.boundingBox();
  await page.mouse.click(bb.x+bb.width/2, bb.y+bb.height/2);
  await page.waitForTimeout(2500);
  const read = () => page.evaluate(() => {
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)
      .filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded')
      .sort((a,b)=>T(a).length-T(b).length)[0];
    const inv=[...d.querySelectorAll('button')].filter(vis).find(x=>/^Invite \(/.test(T(x)));
    return {invite: inv?T(inv):null, inviteDisabled: inv?inv.disabled:null,
      rows: [...d.querySelectorAll('input')].map(i=>({l:i.getAttribute('aria-label'), d:i.disabled, c:i.checked}))};
  });
  const out = {before: await read()};
  const clickRow = async (name) => {
    const h = await page.evaluateHandle((name)=>{
      const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
      const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
      const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)
        .filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded')
        .sort((a,b)=>T(a).length-T(b).length)[0];
      // smallest visible element containing the name that has a clickable box
      let best=null,bl=1e9;
      for(const e of d.querySelectorAll('*')){const t=T(e); if(!t.startsWith(name))continue;
        const r=e.getBoundingClientRect(); if(r.width<40||r.height<20)continue;
        if(t.length<bl){bl=t.length;best=e;}}
      return best;}, name);
    const el = h.asElement(); if(!el) return {clicked:false};
    const r = await el.boundingBox();
    await page.mouse.click(r.x+r.width/2, r.y+r.height/2);
    await page.waitForTimeout(1200);
    return {clicked:true, box:r};
  };
  out.tryBanned = await clickRow(process.env.QA_TRY || 'QA Carol');
  out.afterBanned = await read();
  out.tryControl = await clickRow(process.env.QA_CTRL || 'QA Dave');
  out.afterControl = await read();
  return out;
};
