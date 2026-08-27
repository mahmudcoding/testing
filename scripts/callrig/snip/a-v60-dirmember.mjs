const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  // hover Dave's row and look for actions
  const pos = await page.evaluate((vs)=>{const vis=eval(vs);
    const el=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/^QA Dave$/.test((e.innerText||'').trim()))[0];
    if(!el) return null; const r=el.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  out.davePos=pos;
  if(pos){ await page.mouse.move(pos.x,pos.y); await page.waitForTimeout(1400); }
  out.actions = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,34))
      .filter(a=>/remove|more|manage|actions|workspace/i.test(a)).slice(0,10);},VS);
  // try clicking a per-row more/actions control near Dave
  const more = await page.evaluate((vs)=>{const vis=eval(vs);
    const el=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/^QA Dave$/.test((e.innerText||'').trim()))[0];
    if(!el) return null; const row=el.closest('li,tr,div[class*="flex"]');
    if(!row) return null;
    const b=[...row.querySelectorAll('button')].filter(vis).map(b=>({al:(b.getAttribute('aria-label')||'').slice(0,30),t:(b.innerText||'').trim().slice(0,16)}));
    return b;},VS);
  out.daveRowButtons = more;
  return out;
};
