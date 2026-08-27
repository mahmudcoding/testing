import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const nameLeaf=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
      && /\.(txt|png|zip|wav|mp4)$/i.test((e.textContent||'').trim()));
    const out=nameLeaf.slice(0,6).map(leaf=>{
      // the row = nearest ancestor that is a button/row and contains the name
      let row=leaf; for(let i=0;i<6&&row;i++){ if(row.tagName==='BUTTON'||row.getAttribute('role')==='row') break; row=row.parentElement; }
      const rowRect=row?row.getBoundingClientRect():null;
      // every leaf inside that row, with its x, so the columns are visible
      const cells=row? [...row.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0)
        .map(e=>({x:Math.round(e.getBoundingClientRect().x), t:(e.textContent||'').trim().slice(0,26)}))
        .filter(c=>c.t) : [];
      return {name:leaf.textContent.trim().slice(0,24),
        rowTag: row? row.tagName+'/'+(row.getAttribute('role')||'-') : 'none',
        rowTop: rowRect? Math.round(rowRect.y):null, cells};
    });
    // and any group headers on the page (leaves whose whole text is Today/Yesterday)
    const headers=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
      && /^(Today|Yesterday)$/.test((e.textContent||'').trim()))
      .map(e=>({t:e.textContent.trim(), y:Math.round(e.getBoundingClientRect().y)}));
    return {groupHeaders:headers, rows:out};
  });
};
