export default async ({page}) => {
  const who = process.env.QA_TO || 'QA Carol';
  const pick = await page.evaluate((w)=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    const c=[...document.querySelectorAll('[role="menu"],[role="listbox"],[role="dialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=c[c.length-1]; if(!p) return {err:'no menu'};
    const it=[...p.querySelectorAll('[role="menuitem"],[role="option"],button')].filter(vis)
      .find(x=>(x.textContent||'').includes(w));
    if(!it) return {err:'no option'}; it.click(); return {picked:(it.textContent||'').trim()};
  }, who);
  await page.waitForTimeout(2000);
  const sel='[data-testid="call-side-panel-slot"] textarea, [data-testid="call-side-panel-slot"] input[type="text"], [data-testid="call-side-panel-slot"] input:not([type])';
  const composerLabel = await page.evaluate((s)=>{const e=document.querySelector(s);
    return e?{aria:e.getAttribute('aria-label'), ph:e.placeholder}:null;}, sel);
  const el = await page.$(sel);
  if(!el) return {pick, err:'no composer'};
  await el.click(); await el.fill(''); await el.type(process.env.QA_TEXT||'priv-to-carol',{delay:20});
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?(p.innerText||'').replace(/\n+/g,' | ').slice(0,400):null;});
  return {pick, composerLabel, after};
};
