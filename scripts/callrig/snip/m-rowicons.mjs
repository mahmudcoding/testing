import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  return await page.evaluate(() => {
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const acts=[...document.querySelectorAll('button[aria-label*="Participant actions"]')].filter(vis);
    return acts.map(a=>{
      let row=a;
      for(let i=0;i<8&&row;i++){row=row.parentElement;if(!row)break;
        if(/QA (Owner|Alice|Bob|Carol|Guest|Dave|Admin)/.test(T(row)))break;}
      if(!row) return null;
      const marks=[...row.querySelectorAll('*')].filter(e=>{
        const r=e.getBoundingClientRect(); return r.width>2&&r.height>2;})
        .map(e=>({tag:e.tagName, al:e.getAttribute('aria-label'), title:(e.querySelector&&e.querySelector('title')?e.querySelector('title').textContent:null),
                  cls:(e.getAttribute('class')||'').toString().slice(0,50), txt:(e.children.length?null:(e.textContent||'').trim().slice(0,30))}))
        .filter(m=>m.al||m.title||(m.tag==='SVG'||m.tag==='svg')||m.txt);
      return {row:T(row), marks};
    }).filter(Boolean);
  });
};
