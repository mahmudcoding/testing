import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('response', r=>{ const u=r.url(); if(/\/api\/v1\/search/.test(u))
    reqs.push(decodeURIComponent(u.split('/api/v1/')[1]).slice(0,140)); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  out.membership = await page.evaluate(`(async () => {
     const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
     const mine=await g('/api/v1/workspaces/${WS}/channels');
     const arr=(mine.j&&(mine.j.channels||mine.j.data||mine.j.items))||[];
     return {myChannels:arr.map(c=>c.name)}; })()`);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600); reqs.length=0;
  await page.keyboard.type(':in #qa-empty probe'); await page.waitForTimeout(6000);
  out.request = reqs[reqs.length-1]||'(none)';
  out.ui = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const chips=[...d.querySelectorAll('button')].filter(vis)
       .map(b=>(b.getAttribute('aria-label')||'')).filter(a=>/Remove .* filter/.test(a));
     const rows=[...d.querySelectorAll('[role=option]')].filter(vis)
       .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim());
     const chans=[...new Set(rows.map(r=>(r.match(/#[\\w-]+/)||[''])[0]).filter(Boolean))];
     return {chips, nRows:rows.length, channelsInResults:chans,
             tabs:[...d.querySelectorAll('[role=tab]')].filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()),
             firstRow:rows[0]?rows[0].slice(0,60):null}; })()`);
  await page.keyboard.press('Escape');
  return out;
};
