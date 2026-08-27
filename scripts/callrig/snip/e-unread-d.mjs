export default async ({page}) => {
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    // find the sidebar link for qa-general, then walk UP to the full row
    let el=[...document.querySelectorAll('a,button')].filter(vis)
      .find(e=>/qa-general/.test((e.getAttribute('aria-label')||e.innerText||'')));
    if(!el) return {none:true};
    let row=el;
    for(let i=0;i<4;i++){ if(row.parentElement) row=row.parentElement; }
    const desc=[...row.querySelectorAll('*')].filter(vis).filter(e=>e.children.length===0)
      .map(e=>({tag:e.tagName, txt:e.textContent.trim().slice(0,24), cls:(e.className||'').toString().slice(0,45)}))
      .filter(d=>d.txt);
    return {
      rowText: row.innerText.replace(/\n+/g,' | ').slice(0,160),
      linkAria: el.getAttribute('aria-label'),
      linkHTML: el.outerHTML.slice(0,300),
      leafNodes: desc.slice(0,14),
      // does the row carry any element whose text is a bare number?
      numeric: desc.filter(d=>/^\d+$/.test(d.txt)),
      // compare with a channel that has no unread
      privRow: (()=>{const p=[...document.querySelectorAll('a,button')].filter(vis)
        .find(e=>/qa-private/.test((e.getAttribute('aria-label')||e.innerText||'')));
        return p? p.outerHTML.slice(0,200):null;})()
    };
  });
};
