import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const rows = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main')||document.body;
    return [...m.querySelectorAll('button,a,[role=row],tr')].filter(vis)
      .map(e=>({t:e.tagName,l:(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,44)}))
      .filter(o=>o.l.length>2).slice(0,30);
  });
  // right-click the first file row to get the context menu
  const menu = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main')||document.body;
    const cand=[...m.querySelectorAll('[role=row],tr,li,div')].filter(vis)
      .filter(e=>/\.(txt|png|pdf|jpg|y4m|wav)/i.test(e.textContent||''))
      .sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)[0];
    if(!cand) return {noRow:true};
    cand.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,clientX:200,clientY:200}));
    return {row:(cand.textContent||'').replace(/\s+/g,' ').slice(0,50)};
  });
  await page.waitForTimeout(1500);
  const items = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('[role=menuitem],[role=menu] button,[data-radix-menu-content] *')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim())
      .filter(t=>t.length>1&&t.length<40);
  });
  return {rowsSample:rows.slice(0,12), menuTrigger:menu, menuItems:[...new Set(items)].slice(0,15)};
};
