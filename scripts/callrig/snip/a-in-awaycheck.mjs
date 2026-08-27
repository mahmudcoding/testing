export default async ({page}) => {
  return await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const hits=[...r.querySelectorAll('*')].filter(e=>{
      const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
      const tid=(e.getAttribute&&e.getAttribute('data-testid'))||'';
      return /right back|away|be back|brb/i.test(own) || /away|brb/i.test(tid);
    }).map(e=>{const q=e.getBoundingClientRect();
      return ((e.getAttribute&&e.getAttribute('data-testid'))||'')+'|'+(e.textContent||'').trim().slice(0,40)+'|'+Math.round(q.width)+'x'+Math.round(q.height);});
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return {hits:hits.slice(0,5), panel:p?(p.innerText||'').replace(/\s+/g,' ').slice(0,200):'(none)'};
  });
};
