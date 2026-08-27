export default async ({page}) => {
  await page.waitForTimeout(500);
  const state = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).map(x=>(x.getAttribute('aria-label')||x.textContent||'').replace(/\s+/g,' ').trim());
    return {btns:b.filter(l=>/admit|approve|deny|waiting|request/i.test(l)), all:b.slice(0,40), body:(document.body.innerText||'').replace(/\n+/g,' | ').slice(0,500)};
  });
  const clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>x.getClientRects().length && /^admit$/i.test((x.textContent||'').trim()));
    if(b){b.click();return 'admit-btn';}
    const p=[...document.querySelectorAll('button')].find(x=>x.getClientRects().length && /admit/i.test((x.getAttribute('aria-label')||x.textContent||'')));
    if(p){p.click();return 'admit-like:'+(p.getAttribute('aria-label')||p.textContent).trim();}
    return null;
  });
  await page.waitForTimeout(3000);
  const after = await page.evaluate(()=>({body:(document.body.innerText||'').replace(/\n+/g,' | ').slice(0,400)}));
  return {state, clicked, after};
};
