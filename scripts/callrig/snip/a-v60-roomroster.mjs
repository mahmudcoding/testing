const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    if(r.status!==200) return 'guest(anon)'; const j=await r.json().catch(()=>null); return (j?.email||'').split('@')[0];});
  const hasList = await page.evaluate((vs)=>{const vis=eval(vs);const l=document.querySelector('[data-testid="participants-list"]');return !!l&&vis(l);},VS);
  if(!hasList){ await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(2600); }
  const r = await page.evaluate((vs)=>{const vis=eval(vs);
    const l=document.querySelector('[data-testid="participants-list"]');
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop();
    return { header:l?(l.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,52):null,
      rows:l?[...l.querySelectorAll('[data-testid="participant-row"]')].map(x=>(x.innerText||'').replace(/\s+/g,' ').trim().slice(0,30)):null,
      sidePanel:(d?.innerText||'').replace(/\s+/g,' ').slice(0,140),
      tabs:[...document.querySelectorAll('button,[role="tab"]')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/Room G|Guest Pass/.test(t)).slice(0,3) };},VS);
  return { who, ...r };
};
