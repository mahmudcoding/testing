export default async ({page}) => {
  const before = await page.evaluate(()=>{
    const e=document.querySelector('[data-testid="call-ended-transcript"]');
    return e?{html:e.innerHTML.replace(/\s+/g,' ').slice(0,900), text:e.innerText.replace(/\n+/g,' | ').slice(0,300)}:null;
  });
  // click SHOW MESSAGES
  const clicked = await page.evaluate(()=>{
    const e=document.querySelector('[data-testid="call-ended-transcript"]');
    if(!e) return null;
    const c=[...e.querySelectorAll('button,summary,[role="button"],a')].find(x=>/show messages/i.test(x.textContent||''));
    if(c){ c.click(); return c.textContent.trim().slice(0,40); }
    // maybe it's a <details>
    const d=e.querySelector('details'); if(d){ d.open=true; return 'details.open'; }
    return null;
  });
  await page.waitForTimeout(2500);
  const after = await page.evaluate(()=>{
    const e=document.querySelector('[data-testid="call-ended-transcript"]');
    return e?e.innerText.replace(/\n+/g,' | ').slice(0,600):null;
  });
  const api = await page.evaluate(async ()=>{
    const out={};
    for (const p of ['/api/v1/meeting/V4OTZWUJP1IN7EQ/transcript','/api/v1/meeting/V4OTZWUJP1IN7EQ/summary','/api/v1/meeting/V4OTZWUJP1IN7EQ/ai-summary']) {
      try { const r=await fetch(p,{credentials:'include'}); out[p]=r.status+' '+(await r.text()).slice(0,140); } catch(e){ out[p]='ERR'; }
    }
    return out;
  });
  return {before, clicked, after, api};
};
