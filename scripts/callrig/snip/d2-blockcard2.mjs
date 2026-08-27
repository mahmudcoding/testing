export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('button,a,[role=button]')].filter(vis)
      .find(e=>(e.getAttribute('aria-label')||'')==="Open QA Bob's profile");
    if(el) el.click();
  });
  await page.waitForTimeout(2600);
  return await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog]') ||
      [...document.querySelectorAll('aside,section,div')].filter(vis)
       .filter(e=>/QA Bob/.test(e.innerText||'')&&(e.innerText||'').length<800)
       .sort((a,b)=>a.innerText.length-b.innerText.length)[0];
    if(!d) return {open:false};
    const btns=[...d.querySelectorAll('button')].filter(vis)
      .map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,28), off:b.disabled===true}));
    const t=(d.innerText||'').replace(/\s+/g,' ');
    return { open:true, text:t.slice(0,260), buttons:btns,
      hasUnblock: btns.some(b=>/unblock/i.test(b.l)),
      blockDisabled: (btns.find(b=>/^Block$/i.test(b.l))||{}).off,
      membershipLine: /membership|not a member|not confirmed|workspace/i.test(t) };
  });
};
