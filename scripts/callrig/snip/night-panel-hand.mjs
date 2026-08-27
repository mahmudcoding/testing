export default async ({page}) => page.evaluate(()=>{
  const p=document.querySelector('[data-testid="participants-list-panel"]');
  if(!p) return {none:true};
  const rows=[...p.querySelectorAll('li,[role="listitem"],div')]
    .filter(e=>/QA (Owner|Carol|Dave)/.test(e.textContent||'') && (e.textContent||'').length<80);
  const seen=new Set(); const out=[];
  for(const r of rows){ const t=(r.textContent||'').replace(/\s+/g,' ').trim();
    if(seen.has(t)) continue; seen.add(t);
    out.push({txt:t.slice(0,34),
      marks:[...r.querySelectorAll('[data-testid],svg,[aria-label],[title]')]
        .map(e=>e.getAttribute('data-testid')||e.getAttribute('aria-label')||e.getAttribute('title')||'svg')
        .filter(Boolean).slice(0,5),
      svgCount:r.querySelectorAll('svg').length});}
  return {rows: out.slice(0,8), panelHasHandWord:/hand|Hand/.test(p.innerText||'')};
});
