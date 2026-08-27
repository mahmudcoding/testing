export default async ({page}) => {
  return await page.evaluate(()=>{
    const els=[...document.querySelectorAll('[data-message-id]')].filter(m=>/QA-S2-OVF-B/.test(m.innerText||''));
    const el=els.pop(); if(!el) return {err:'not found'};
    const leaves=[...el.querySelectorAll('*')].filter(e=>e.children.length===0);
    const clipped=leaves.filter(e=>e.scrollWidth > e.clientWidth+1).map(e=>{
      const cs=getComputedStyle(e); const r=e.getBoundingClientRect();
      return {tag:e.tagName, sw:e.scrollWidth, cw:e.clientWidth,
        overflow:cs.overflow, textOverflow:cs.textOverflow, whiteSpace:cs.whiteSpace,
        wordBreak:cs.wordBreak, overflowWrap:cs.overflowWrap,
        w:Math.round(r.width), h:Math.round(r.height), txt:(e.textContent||'').slice(0,40)};
    });
    // the message body text itself
    const bodyText=leaves.filter(e=>/QA-S2-OVF-B/.test(e.textContent||'')).map(e=>{
      const cs=getComputedStyle(e); return {txt:(e.textContent||'').slice(0,40), sw:e.scrollWidth, cw:e.clientWidth,
        overflowWrap:cs.overflowWrap, wordBreak:cs.wordBreak};});
    return {clipped, bodyText, msgText: el.innerText.replace(/\n+/g,' | ').slice(0,160)};
  });
};
