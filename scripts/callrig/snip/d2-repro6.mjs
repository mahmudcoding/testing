export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const clicked = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('button,a,[role=button]')].filter(vis)
      .find(e=>(e.getAttribute('aria-label')||'')==="Open QA Alice's profile");
    if(!el) return false; el.click(); return true;
  });
  out.clicked = clicked;
  await page.waitForTimeout(3000);
  out.card = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const dlg=document.querySelector('[role=dialog]') ||
      [...document.querySelectorAll('aside,section,div')].filter(vis)
        .filter(e=>/QA Alice/.test(e.innerText||'') && (e.innerText||'').length<700)
        .sort((a,b)=>a.innerText.length-b.innerText.length)[0];
    if(!dlg) return {found:false};
    const t=(dlg.innerText||'').replace(/\s+/g,' ');
    return { found:true, text:t.slice(0,320),
      hasJobTitle:/QA Engineer/.test(t), hasPronouns:/they\/them/.test(t),
      hasDepartment:/Quality/.test(t), hasStatus:/QA control field/.test(t),
      hasTimezone:/Tashkent|UTC|\+05|local time/i.test(t) };
  });
  return out;
};
