import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const out={net:[]};
  page.on('response', async r=>{ if(!/\/api\/v1\//.test(r.url()))return; if(r.request().method()==='GET')return;
    out.net.push({m:r.request().method(),s:r.status(),u:r.url().replace(/^https:\/\/[^/]+/,'')}); });
  out.click = await page.evaluate((v)=>{ const vis=eval(v);
    const b=document.querySelector('[data-testid="side-room-close"]');
    if(!b||!vis(b)) return {err:'no close button'}; b.click(); return {ok:true}; }, VIS);
  await page.waitForTimeout(2500);
  out.dlg = await page.evaluate((v)=>{ const vis=eval(v);
    const ds=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const d=ds.pop(); if(!d) return {none:true};
    const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^Close room$/i.test((x.textContent||'').trim()));
    const txt=(d.innerText||'').replace(/\s+/g,' ').slice(0,140);
    if(b){ b.click(); return {txt, clicked:true}; }
    return {txt, buttons:[...d.querySelectorAll('button')].filter(vis).map(x=>(x.textContent||'').trim().slice(0,20))}; }, VIS);
  await page.waitForTimeout(5000);
  return out;
};
