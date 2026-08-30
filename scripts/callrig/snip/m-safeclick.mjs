import { DOM, safeClick } from './lib.mjs';
// QA_SEL='[data-testid="header-tab-leave"]'
export default async ({page}) => {
  await page.evaluate(DOM);
  const sel = process.env.QA_SEL;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'){let b=null;try{b=(await r.text()).slice(0,200);}catch(e){}
    net.push({m:r.request().method(),s:r.status(),u:u.replace(/https:\/\/[^/]+/,''),res:b});}});
  const pre = await page.evaluate((sel)=>{const e=document.querySelector(sel); if(!e) return null;
    const r=e.getBoundingClientRect();
    const top=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);
    return {rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
      label:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40),
      disabled:e.disabled||e.getAttribute('aria-disabled')==='true',
      topmostIsSelf: !!top && (e===top || e.contains(top)),
      topmostTag: top?top.tagName+'.'+(top.className||'').toString().slice(0,40):null};}, sel);
  const res = await safeClick(page, sel).catch(e=>({err:String(e).slice(0,200)}));
  await page.waitForTimeout(3000);
  const post = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded');
    const root=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return {dialogs: ds.map(d=>(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,200)),
      text:(root.innerText||'').replace(/\s+/g,' ').trim().slice(0,300)};});
  return {pre, safeClick: res, post, net};
};
