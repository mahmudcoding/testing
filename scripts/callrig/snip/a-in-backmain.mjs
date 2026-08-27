export default async ({page}) => {
  const before = await page.evaluate(()=>({url:location.pathname,
    hdr:((document.querySelector('[data-testid="call-overlay-expanded"]')||document.body).innerText||'').replace(/\n+/g,' | ').slice(0,160)}));
  const left = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/^Leave room$/i.test((x.textContent||'').trim())); if(b){b.click();return true;} return false;});
  await page.waitForTimeout(5000);
  // close side rooms panel, open participants panel
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const s=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-breakout-rooms'); if(s)s.click();});
  await page.waitForTimeout(1200);
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const s=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-people-toggle'); if(s)s.click();});
  await page.waitForTimeout(2000);
  const after = await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const p=[...r.querySelectorAll('[data-testid="call-side-panel-slot"]')][0];
    return {url:location.pathname, panel:p?(p.innerText||'').replace(/\n+/g,' | ').slice(0,300):null,
      triggers:p?[...p.querySelectorAll('button')].filter(b=>/participant actions/i.test(b.getAttribute('aria-label')||'')).length:0};
  });
  return {before, left, after};
};
