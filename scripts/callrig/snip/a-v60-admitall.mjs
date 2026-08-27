const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const hasList = await page.evaluate((vs)=>{const vis=eval(vs);const l=document.querySelector('[data-testid="participants-list"]');return !!l&&vis(l);},VS);
  if(!hasList){ await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(2800); }
  const aa = page.locator('button',{hasText:/^Admit all$/i}).first();
  out.admitAllFound = await aa.count()>0;
  if(out.admitAllFound){ await aa.click(); await page.waitForTimeout(7000); }
  else {
    // click each Admit in turn
    for(let i=0;i<9;i++){
      const b=page.locator('button[aria-label^="Admit"]').first();
      if(!(await b.count())) break;
      const l=await b.getAttribute('aria-label'); await b.click().catch(()=>{});
      out['admit'+i]=l; await page.waitForTimeout(2600);
    }
  }
  out.roster = await page.evaluate((vs)=>{const vis=eval(vs);
    const l=document.querySelector('[data-testid="participants-list"]');
    return l?{ header:(l.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,44),
      n:[...l.querySelectorAll('[data-testid="participant-row"]')].length,
      rows:[...l.querySelectorAll('[data-testid="participant-row"]')].map(r=>(r.innerText||'').replace(/\s+/g,' ').trim().slice(0,26))}:null;},VS);
  out.stillWaiting = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button[aria-label^="Admit"]')].filter(vis).length;},VS);
  return out;
};
