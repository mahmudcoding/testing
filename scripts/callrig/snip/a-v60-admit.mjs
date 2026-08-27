const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  // open Participants panel
  const p = page.locator('button[aria-label="Participants"]').first();
  if(await p.count()){ await p.click(); await page.waitForTimeout(2200); }
  out.panel = await page.evaluate((vs)=>{const vis=eval(vs);
    const body=document.body;
    return { txt:(document.querySelector('[role="dialog"],aside')?.innerText||body.innerText||'').replace(/\s+/g,' ').slice(0,300),
      admitBtns:[...body.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,26))
        .filter(t=>/admit|approve|accept|deny|reject/i.test(t)) };},VS);
  for(const lbl of ['Admit all','Admit','Approve','Accept']){
    const b = page.locator('button', { hasText: new RegExp('^'+lbl+'$','i') }).first();
    if(await b.count()){ await b.click().catch(()=>{}); out.clicked=lbl; await page.waitForTimeout(3500); break; }
  }
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    return { roster:[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/QA (Alice|Bob|Carol)/.test(e.innerText||'')).map(e=>e.innerText.trim().slice(0,24)).slice(0,10),
      vids:document.querySelectorAll('video').length,
      txt:(document.querySelector('[role="dialog"],aside')?.innerText||'').replace(/\s+/g,' ').slice(0,200) };},VS);
  return out;
};
