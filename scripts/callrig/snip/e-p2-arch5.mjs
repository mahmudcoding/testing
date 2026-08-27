export default async ({page}) => {
  return await page.evaluate(()=>{
    const vis = e => { let n=e,o=1; while(n&&n!==document.documentElement){const s=getComputedStyle(n); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); n=n.parentElement;} const r=e.getBoundingClientRect(); return o>0.01 && r.width>0 && r.height>0; };
    // every visible control on the page, with its position, so the modal's own are obvious
    const all=[...document.querySelectorAll('button,a,[role=button],[role=menuitem],input')].filter(vis);
    // find the element whose text mentions archive, walking up from a text node
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const hits=[]; let n;
    while(n=walker.nextNode()){ const t=n.nodeValue.trim(); if(/archiv/i.test(t) && n.parentElement && vis(n.parentElement)) hits.push({text:t.slice(0,80), tag:n.parentElement.tagName, cls:(n.parentElement.className||'').toString().slice(0,30)}); }
    return {
      totalControls: all.length,
      controls: all.map(e=>{const r=e.getBoundingClientRect(); return {l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,38), x:Math.round(r.x), y:Math.round(r.y)};}),
      archiveTextNodes: hits.slice(0,25)
    };
  });
};
