export default async ({page}) => {
  const R = () => document.querySelector('[data-testid="call-overlay-expanded"]') || document.body;
  await page.evaluate(()=>{const b=[...(document.querySelector('[data-testid="call-overlay-expanded"]')||document.body).querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-people-toggle'); if(b) b.click();});
  await page.waitForTimeout(2500);
  const panel = await page.evaluate(()=>{
    const root = document.querySelector('[data-testid="call-overlay-expanded"]') || document.body;
    const asides = [...root.querySelectorAll('aside,[role="complementary"],[data-testid*="panel"]')].filter(e=>e.getClientRects().length);
    const pick = asides.sort((a,b)=>b.offsetHeight-a.offsetHeight)[0];
    if(!pick) return {err:'no panel', tids:[...root.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).slice(0,40)};
    return {tid: pick.getAttribute('data-testid'),
      text: (pick.innerText||'').replace(/\n+/g,' | ').slice(0,700),
      buttons: [...pick.querySelectorAll('button')].filter(b=>b.getClientRects().length)
        .map(b=>(b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,30))+(b.getAttribute('data-testid')?' {'+b.getAttribute('data-testid')+'}':'')).slice(0,30)};
  });
  return panel;
};
