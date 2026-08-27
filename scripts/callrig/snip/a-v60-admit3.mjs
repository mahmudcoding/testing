const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/V4OV276ZQQ7FN2U',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.url = await page.evaluate(()=>location.pathname);
  const poll=[]; for(let i=0;i<8;i++){ poll.push(await page.evaluate((vs)=>{const vis=eval(vs);
    return { toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)).filter(Boolean),
      admit:[...document.querySelectorAll('button[aria-label]')].filter(vis).map(b=>b.getAttribute('aria-label')).filter(a=>/^(Admit|Deny)/.test(a||'')) };},VS)); await page.waitForTimeout(600); }
  out.toastSeen = poll.find(p=>p.toasts.length)?.toasts ?? null;
  out.admitBefore = poll.find(p=>p.admit.length)?.admit ?? null;
  if(!out.admitBefore){
    await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{});
    await page.waitForTimeout(2800);
    out.admitAfterOpen = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...document.querySelectorAll('button[aria-label]')].filter(vis).map(b=>b.getAttribute('aria-label')).filter(a=>/^(Admit|Deny)/.test(a||''));},VS);
  }
  const a = page.locator('button[aria-label^="Admit"]').first();
  if(await a.count()){ out.admitting = await a.getAttribute('aria-label'); await a.click(); await page.waitForTimeout(5000); }
  out.roster = await page.evaluate((vs)=>{const vis=eval(vs);
    const l=document.querySelector('[data-testid="participants-list"]');
    return l?{ header:(l.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,60),
      rows:[...l.querySelectorAll('[data-testid="participant-row"]')].map(r=>({txt:(r.innerText||'').replace(/\s+/g,' ').trim().slice(0,34),
        labels:[...r.querySelectorAll('[aria-label]')].map(e=>e.getAttribute('aria-label')).slice(0,6)}))}:null;},VS);
  return out;
};
