export default async ({page}) => {
  const clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length)
      .find(x=>/^Leave room$/i.test((x.textContent||'').trim()));
    if(!b) return {err:'no Leave room'}; b.click(); return {ok:true};});
  await page.waitForTimeout(2500);
  const conf = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
      .filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded');
    const pick=d[d.length-1]; if(!pick) return {err:'no confirm dialog'};
    const b=[...pick.querySelectorAll('button')].filter(vis).find(x=>/^Leave room$/i.test((x.textContent||'').trim()));
    if(!b) return {err:'no confirm btn'}; b.click(); return {ok:true};});
  await page.waitForTimeout(7000);
  return {clicked, conf, head: await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return ((r.innerText||'').replace(/\n+/g,' | ')).slice(0,140);})};
};
