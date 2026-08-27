export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  const open = async () => page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('button,a,[role=button]')].filter(vis)
      .find(e=>(e.getAttribute('aria-label')||'')==="Open QA Bob's profile");
    if(!el) return false; el.click(); return true;
  });
  const card = async () => page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog]') ||
      [...document.querySelectorAll('aside,section,div')].filter(vis)
       .filter(e=>/QA Bob/.test(e.innerText||'')&&(e.innerText||'').length<700)
       .sort((a,b)=>a.innerText.length-b.innerText.length)[0];
    if(!d) return {open:false};
    const btns=[...d.querySelectorAll('button')].filter(vis)
      .map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26), off:b.disabled===true}));
    return { open:true, text:(d.innerText||'').replace(/\s+/g,' ').slice(0,200), buttons:btns };
  });
  out.opened = await open(); await page.waitForTimeout(2200);
  out.before = await card();
  out.blockedListBefore = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
    const p=await r.json(); return (p.users||p.blocked||p.data||[]).length;});
  return out;
};
