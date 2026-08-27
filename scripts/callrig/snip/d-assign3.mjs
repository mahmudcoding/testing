export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto('https://airion-cargo.store/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1500);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const res={};
  // find the trigger structurally, not by text
  res.triggers = await page.evaluate(()=>{
    const o=[];
    document.querySelectorAll('main [role="combobox"], main [aria-haspopup], main button[aria-expanded]').forEach((x,i)=>{
      const r=x.getBoundingClientRect(); if(r.width<=0||r.height<=0) return;
      o.push({i, tag:x.tagName.toLowerCase(), text:(x.innerText||'').trim().slice(0,22), role:x.getAttribute('role')||'', haspopup:x.getAttribute('aria-haspopup')||'', expanded:x.getAttribute('aria-expanded')||''});
    });
    return o;
  });
  const memberIdx = res.triggers.findIndex(t=>/Select a member/i.test(t.text));
  res.memberIdx = memberIdx;
  if (memberIdx >= 0) {
    const el = page.locator('main [role="combobox"], main [aria-haspopup], main button[aria-expanded]').nth(memberIdx);
    await el.click();
    await page.waitForTimeout(2600);
    res.after = await page.evaluate(()=>{
      const trig=[...document.querySelectorAll('main [role="combobox"],main [aria-haspopup],main button[aria-expanded]')].find(x=>/Select a member/i.test((x.innerText||'')));
      const pops=[];
      document.querySelectorAll('[data-radix-popper-content-wrapper],[role="listbox"],[role="menu"],[role="dialog"]').forEach(d=>{
        const r=d.getBoundingClientRect(); pops.push({w:Math.round(r.width),h:Math.round(r.height),text:(d.innerText||'').replace(/\s+/g,' ').slice(0,120)});
      });
      return {expanded:trig?trig.getAttribute('aria-expanded'):'trigger gone', popupCount:pops.length, popups:pops.slice(0,3)};
    });
    // keyboard route: does Enter/Space open it?
    await el.focus().catch(()=>{});
    await page.keyboard.press('Enter').catch(()=>{});
    await page.waitForTimeout(2000);
    res.afterEnter = await page.evaluate(()=>{
      const trig=[...document.querySelectorAll('main [role="combobox"],main [aria-haspopup],main button[aria-expanded]')].find(x=>/Select a member/i.test((x.innerText||'')));
      const n=document.querySelectorAll('[data-radix-popper-content-wrapper],[role="listbox"],[role="menu"]').length;
      return {expanded:trig?trig.getAttribute('aria-expanded'):'gone', popupCount:n};
    });
  }
  await page.keyboard.press('Escape').catch(()=>{});
  return res;
};
