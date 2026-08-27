import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  // find the row for a specific person and its Message button, by position within the row
  const target='QA Carol';
  const info = await page.evaluate((who)=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    const prof=[...m.querySelectorAll('button')].filter(vis)
      .find(e=>e.getAttribute('aria-label')===`Open ${who}'s profile`);
    if(!prof) return {found:false};
    const y=prof.getBoundingClientRect().y;
    const msg=[...m.querySelectorAll('button')].filter(vis)
      .filter(e=>(e.textContent||'').trim()==='Message')
      .map(e=>({e, dy:Math.abs(e.getBoundingClientRect().y-y)}))
      .sort((a,b)=>a.dy-b.dy)[0];
    if(!msg) return {found:true, msgFound:false};
    msg.e.setAttribute('data-qa-target','1');
    return {found:true, msgFound:true, dy:Math.round(msg.dy)};
  }, target);
  if(!info.msgFound) return {info};
  const before=page.url();
  await page.locator('[data-qa-target="1"]').click();
  await page.waitForTimeout(4000);
  const after = await page.evaluate(async ()=>{
    const u=location.pathname;
    const dmId=(u.match(/\/d\/([^/?]+)/)||[])[1]||null;
    let peer=null;
    if(dmId){ const r=await fetch(`/api/v1/messaging/dm/${dmId}`,{credentials:'include'}).catch(()=>null);
      if(r&&r.ok){ const b=await r.json(); peer=JSON.stringify(b).slice(0,160); } }
    const m=document.querySelector('main');
    return {url:u, dmId: dmId?'present':null, header:(m?m.innerText:'').replace(/\s+/g,' ').slice(0,90), peerProbe:peer};
  });
  return {target, info, urlBefore:before.replace(/https?:\/\/[^/]+/,''), after};
};
