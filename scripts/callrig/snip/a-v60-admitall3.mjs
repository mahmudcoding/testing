const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const hasList = await page.evaluate((vs)=>{const vis=eval(vs);const l=document.querySelector('[data-testid="participants-list"]');return !!l&&vis(l);},VS);
  if(!hasList){ await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(2800); }
  const aa = page.locator('button[aria-label^="Admit all"]').first();
  out.admitAll = await aa.count()>0 ? await aa.getAttribute('aria-label') : null;
  if(out.admitAll){ await aa.click(); await page.waitForTimeout(9000); }
  out.roster = await page.evaluate((vs)=>{const vis=eval(vs);
    const l=document.querySelector('[data-testid="participants-list"]');
    return l?{ header:(l.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,50),
      n:[...l.querySelectorAll('[data-testid="participant-row"]')].length,
      rows:[...l.querySelectorAll('[data-testid="participant-row"]')].map(r=>(r.innerText||'').replace(/\s+/g,' ').trim().slice(0,26))}:null;},VS);
  return out;
};
