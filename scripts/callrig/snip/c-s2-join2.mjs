export default async ({page}) => page.evaluate((name)=>{
  const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
  const all=[...document.querySelectorAll('button,a')].filter(v);
  const labels=[...new Set(all.map(b=>(b.getAttribute('aria-label')||b.innerText||'(unnamed)')
    .replace(/\s+/g,' ').trim().slice(0,30)))];
  // locate the element whose own text is exactly the channel name, then walk up for controls
  let host=null;
  for (const e of document.querySelectorAll('*')) {
    if(e.children.length===0 && (e.textContent||'').trim()===name){ host=e; break; }
  }
  let chain=[];
  if(host){ let n=host;
    for(let i=0;i<6&&n;i++){ n=n.parentElement; if(!n) break;
      const btns=[...n.querySelectorAll('button,a')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,24));
      chain.push(`up${i+1}: [${[...new Set(btns)].join(' | ')}]`); } }
  return {pageControls:labels.filter(t=>/join|preview|open|view/i.test(t)).slice(0,8),
          totalControls:labels.length, hostFound:!!host, ancestry:chain};
}, 'qa-c2-join-lr49');
