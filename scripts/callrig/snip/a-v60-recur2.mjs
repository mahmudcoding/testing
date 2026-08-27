const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
const state = (page) => page.evaluate((vs)=>{const vis=eval(vs);
  const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0]||document.body;
  const btn=(re)=>{const b=[...d.querySelectorAll('button')].filter(vis).find(b=>re.test((b.innerText||'').trim()));
    return b?{t:b.innerText.trim().slice(0,22), disabled:b.getAttribute('aria-disabled')||String(b.disabled)}:null;};
  const t=(d.innerText||'').replace(/\s+/g,' ');
  return { repeatBtn:btn(/Does not repeat|Daily|Weekly|Monthly|Every/),
    rrule:btn(/Custom RRULE/), repeatBlock:(t.match(/Repeat[^]{0,60}/)||[''])[0] };},VS);
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5200);
  await page.locator('button',{hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(2800);
  out.initial = await state(page);
  // open the repeat chooser and list what it offers
  await page.locator('[role="dialog"] button',{hasText:/Does not repeat/}).first().click();
  await page.waitForTimeout(2000);
  out.options = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...new Set([...document.querySelectorAll('[role="option"],[role="menuitem"]')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<40))].slice(0,10);},VS);
  // pick a real recurrence
  const picked = await page.evaluate((vs)=>{const vis=eval(vs);
    const o=[...document.querySelectorAll('[role="option"],[role="menuitem"]')].filter(vis)
      .find(o=>/Daily|Weekly|Every day|Every week/i.test(o.innerText||''));
    if(!o) return null; const t=o.innerText.trim().slice(0,24); o.click(); return t;},VS);
  out.picked=picked;
  await page.waitForTimeout(2200);
  out.afterPick = await state(page);
  return out;
};
