const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5200);
  await page.locator('button',{hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(2800);
  out.form = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0]||document.body;
    const t=(d.innerText||'').replace(/\s+/g,' ');
    return { repeat:(t.match(/Repeat[^]{0,70}/)||[''])[0], hasCustomRRULE:/Custom RRULE/i.test(t),
      allDay:/All day/i.test(t), durations:(t.match(/15 min[^]{0,58}/)||[''])[0],
      whenBlock:(t.match(/When[^]{0,120}/)||[''])[0] };},VS);
  const rep = page.locator('[role="dialog"] button',{hasText:/Does not repeat/}).first();
  if(await rep.count()){ await rep.click(); await page.waitForTimeout(2000);
    out.repeatOptions = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...new Set([...document.querySelectorAll('[role="option"],[role="menuitem"],[role="listbox"] *')].filter(vis)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<40))].slice(0,12);},VS); }
  // custom RRULE surface
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(900);
  const cr = page.locator('[role="dialog"] button',{hasText:/Custom RRULE/}).first();
  if(await cr.count()){ await cr.click(); await page.waitForTimeout(2200);
    out.rruleSurface = await page.evaluate((vs)=>{const vis=eval(vs);
      const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
      return { txt:(d?.innerText||'').replace(/\s+/g,' ').slice(0,220),
        inputs:[...(d?.querySelectorAll('input')||[])].filter(vis).map(i=>({ph:(i.placeholder||'').slice(0,26),type:i.type})) };},VS); }
  return out;
};
