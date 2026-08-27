const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
const findAdmit = (page) => page.evaluate((vs)=>{const vis=eval(vs);
  return [...document.querySelectorAll('button')].filter(vis)
    .map(b=>({al:(b.getAttribute('aria-label')||'').slice(0,30), t:(b.innerText||'').trim().slice(0,20)}))
    .filter(x=>/admit|deny/i.test(x.al+x.t));},VS);
export default async ({ page }) => {
  const out={};
  out.before = await findAdmit(page);
  if(!out.before.length){
    await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{});
    await page.waitForTimeout(2500);
    out.afterOpen = await findAdmit(page);
  }
  const admit = page.locator('button[aria-label^="Admit"]').first();
  out.admitCount = await admit.count();
  if(out.admitCount){ out.label = await admit.getAttribute('aria-label'); await admit.click(); await page.waitForTimeout(4000); }
  out.roster = await page.evaluate((vs)=>{const vis=eval(vs);
    const seen=new Set();
    return [...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/QA (Alice|Bob|Carol)/.test(e.innerText||''))
      .map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,26)).filter(t=>{if(seen.has(t))return false;seen.add(t);return true;}).slice(0,12);},VS);
  out.stillWaiting = await findAdmit(page);
  return out;
};
