export default async ({page}) => await page.evaluate(()=>{
  const els=[...document.querySelectorAll('[data-testid="participant-name"]')];
  return els.map(e=>{
    const cs=getComputedStyle(e);
    return {text:(e.textContent||'').trim(), scrollW:e.scrollWidth, clientW:e.clientWidth,
            overflow:cs.overflow, textOverflow:cs.textOverflow, whiteSpace:cs.whiteSpace,
            maxWidth:cs.maxWidth, width:Math.round(e.getBoundingClientRect().width),
            clipped: e.scrollWidth>e.clientWidth+1};
  });
});
