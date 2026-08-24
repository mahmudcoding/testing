export default async ({page}) => await page.evaluate(()=>{
  const p=document.querySelector('[data-testid="in-call-chat-panel"]');
  if(!p) return 'no panel';
  const hits=[...p.querySelectorAll('*')].filter(e=>e.children.length===0 && /Message everyone/.test(e.textContent||''));
  return hits.map(e=>{
    const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
    return {tag:e.tagName, cls:e.className.toString().slice(0,70), w:Math.round(r.width), h:Math.round(r.height),
            clip:cs.clip, clipPath:cs.clipPath, pos:cs.position, overflow:cs.overflow,
            visuallyHidden: (r.width<=1||r.height<=1||cs.clipPath!=='none'||cs.clip!=='auto'),
            forAttr: e.getAttribute('for')};
  });
});
