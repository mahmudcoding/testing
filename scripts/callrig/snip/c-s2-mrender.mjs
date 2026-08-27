export default async ({page}) => {
  return await page.evaluate(()=>{
    const res=[];
    for (const el of document.querySelectorAll('main [data-message-id]')) {
      const t=el.innerText||'';
      if (!/QA-S2-(MANUAL|PICKED)-1/.test(t)) continue;
      // find the deepest node whose text starts with "@QA Bob"
      let hit=null;
      const walk=(n)=>{ for(const c of n.children){ const ct=(c.innerText||c.textContent||'').trim();
        if(ct.startsWith('@QA Bob')&&ct.length<40){hit=c;} walk(c);} };
      walk(el);
      const d=hit?getComputedStyle(hit):null;
      res.push({tag:/MANUAL/.test(t)?'MANUAL':'PICKED',
        node: hit? {name:hit.tagName, cls:(hit.className||'').toString().slice(0,90),
          href:hit.getAttribute('href'), role:hit.getAttribute('role'),
          dataset:Object.keys(hit.dataset||{}),
          color:d.color, bg:d.backgroundColor, weight:d.fontWeight,
          cursor:d.cursor, textDecoration:d.textDecorationLine} : null,
        html: el.querySelector('[data-message-id] , *') ? null : null});
    }
    return res;
  });
};
