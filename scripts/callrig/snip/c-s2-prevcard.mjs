export default async ({page}) => page.evaluate(()=>{
  const out=[];
  for (const tag of ['QA-S2-LINK1','QA-S2-LINK2','QA-S2-LINK3']){
    const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(e=>new RegExp(tag).test(e.innerText||''));
    if(!el){ out.push({tag, missing:true}); continue; }
    const leaves=[...el.querySelectorAll('*')].filter(e=>e.children.length===0)
      .map(e=>{const cs=getComputedStyle(e); const r=e.getBoundingClientRect();
        return {t:(e.textContent||'').trim().slice(0,54), w:Math.round(r.width),
          sw:e.scrollWidth, cw:e.clientWidth,
          ellipsis:cs.textOverflow, ws:cs.whiteSpace, of:cs.overflow,
          lineClamp:cs.webkitLineClamp};})
      .filter(x=>x.t);
    out.push({tag, leaves});
  }
  return out;
});
