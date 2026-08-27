import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.raw = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/workspaces/${WS}/presence',{credentials:'include'});
    const t=await r.text();
    return {s:r.status, len:t.length, body:t.slice(0,600)}; })()`);
  out.rawMembers = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/workspaces/${WS}/members',{credentials:'include'});
    const t=await r.text();
    return {s:r.status, len:t.length, head:t.slice(0,400)}; })()`);
  out.domPeople = await page.evaluate(`(() => { ${VISFN}
    const main=document.querySelector('main')||document.body;
    const btns=[...main.querySelectorAll('button')].filter(vis).filter(b=>/QA /.test(b.textContent||''));
    return btns.slice(0,10).map(b=>{
      const r=b.getBoundingClientRect();
      return {t:(b.innerText||'').replace(/\\n+/g,' / ').slice(0,70), testid:b.getAttribute('data-testid'),
        dots:[...b.querySelectorAll('[class*=status],[class*=presence],[data-status],[aria-label*=nline],[aria-label*=ffline]')].map(d=>(d.getAttribute('aria-label')||d.getAttribute('data-status')||String(d.className).slice(0,40))).slice(0,3)};
    }); })()`);
  return out;
};
