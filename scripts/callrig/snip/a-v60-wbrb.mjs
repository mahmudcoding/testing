const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const b = page.locator('button[aria-label="Will be right back"]').first();
  out.found = await b.count()>0;
  if(!out.found){
    out.available = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...document.querySelectorAll('button')].filter(vis).map(x=>(x.getAttribute('aria-label')||'').slice(0,26)).filter(Boolean).slice(-20);},VS);
    return out;
  }
  out.pressedBefore = await b.getAttribute('aria-pressed');
  await b.click();
  await page.waitForTimeout(3000);
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    const x=[...document.querySelectorAll('button')].filter(vis).find(x=>/Will be right back|I.m back|Back/i.test(x.getAttribute('aria-label')||''));
    return { label:x?x.getAttribute('aria-label'):null, pressed:x?x.getAttribute('aria-pressed'):null,
      selfMarkers:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/right back|away|brb/i.test(e.innerText||'')).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,40)).slice(0,6) };},VS);
  return out;
};
