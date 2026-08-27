export default async ({page}) => {
  const read=async()=>await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    if(!d) return null;
    return [...d.querySelectorAll('button')].filter(b=>/stars$/.test(b.getAttribute('aria-label')||''))
      .map(b=>{const svg=b.querySelector('svg'); const cs=svg?getComputedStyle(svg):getComputedStyle(b);
        return {l:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed'),
                fill:cs.fill, color:cs.color, cls:(svg?svg.getAttribute('class')||'':'').slice(0,40)};});});
  const before=await read();
  const d=[...await page.$$('[role="dialog"]')].pop();
  for(const b of await d.$$('button')){ const t=((await b.getAttribute('aria-label'))||'').trim();
    if(t==='2 stars'){ await b.click(); break; } }
  await page.waitForTimeout(2500);
  return {before, after: await read()};
};
