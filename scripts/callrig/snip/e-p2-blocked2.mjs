import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  // ALK-1961: does the Favorites filter still label its scope "My files"?
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const scopeLine = `(() => { ${VISFN}
     const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\\s+/g,' ');
     const s=t.match(/\\d+ files? · [^·]+ · [^ ]+/); return s?s[0]:'(no scope line)'; })()`;
  out.ALK1961_before = await page.evaluate(scopeLine);
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>/^Favorites$/.test((x.textContent||'').trim()));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t.none){ await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up(); await page.waitForTimeout(4000); }
  out.ALK1961_afterFavorites = await page.evaluate(scopeLine);
  out.ALK1961_stillSaysMyFiles = /My files/.test(out.ALK1961_afterFavorites);

  // ALK-1972: does "Search in channel" find messages inside a DM?
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.ALK1972 = await page.evaluate(`(async () => {
     // the DM conversation used earlier in this pass
     const r=await fetch('/api/v1/search?q=dm+notification+probe&company_id=O4QEF1XTURESO01&workspace_id=${WS}&limit=10',{credentials:'include'});
     const d=await r.json();
     const msgs=(d.messages||[]);
     return {total:d.total_messages, anyDm:msgs.filter(m=>m.is_dm===true).length,
             sample:msgs.slice(0,2).map(m=>({dm:m.is_dm, hl:(m.highlight||'').slice(0,40)}))}; })()`);
  return out;
};
