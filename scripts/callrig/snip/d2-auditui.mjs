import { safeClick } from './lib.mjs';
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const rows = () => page.evaluate(()=>[...document.querySelectorAll('tbody tr')].map(tr=>{
    const c=[...tr.querySelectorAll('td')].map(x=>(x.innerText||'').replace(/\s+/g,' ').trim());
    return (c[0]||'')+'|'+(c[3]||'')+'|'+((c[4]||'').slice(0,40));
  }));
  const nav = () => page.evaluate(()=>{
    const b=[...document.querySelectorAll('main button')];
    const f=n=>{const x=b.find(y=>y.innerText.trim()===n); return x?(x.disabled?'disabled':'enabled'):'absent';};
    const t=(document.querySelector('main').innerText||'').replace(/\s+/g,' ');
    const m=t.match(/Page\s+\d+[^|]{0,20}/i);
    return {prev:f('Previous'), next:f('Next'), pageLabel:m?m[0].slice(0,30):null};
  });
  const out={};
  out.serverTotal = await page.evaluate(async(WS)=>{
    const r=await fetch(`/api/v1/workspaces/${WS}/admin/audit-log?limit=100`,{credentials:'include'});
    const j=await r.json(); return (Array.isArray(j)?j:(j.entries||[])).length;}, WS);
  out.page1 = {nav: await nav(), n:(await rows()).length};
  const p1=await rows();
  const nx = await safeClick(page,'main button:has-text("Next")');
  out.nextClick={ok:nx.ok, reason:nx.reason};
  await page.waitForTimeout(6000);
  const p2=await rows();
  out.page2={nav: await nav(), n:p2.length};
  out.overlap = p1.filter(r=>p2.includes(r)).length;
  out.union = new Set([...p1,...p2]).size;
  // walk back
  const pv = await safeClick(page,'main button:has-text("Previous")');
  await page.waitForTimeout(5000);
  const p1b=await rows();
  out.backToPage1 = {n:p1b.length, sameAsFirst: JSON.stringify(p1b)===JSON.stringify(p1)};
  return out;
};
