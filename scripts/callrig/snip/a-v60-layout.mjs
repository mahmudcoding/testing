const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const c = page.locator('button[aria-label="Close"]').first();
  if(await c.count()){ await c.click().catch(()=>{}); await page.waitForTimeout(1500); }
  out.toolbar = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis).map(b=>({al:(b.getAttribute('aria-label')||'').slice(0,30),
      x:Math.round(b.getBoundingClientRect().x),y:Math.round(b.getBoundingClientRect().y)}))
      .filter(b=>b.al && b.y>950).slice(0,16);},VS);
  // click the layout / grid icon in the toolbar (not the view toggle in the header)
  for(const al of ['Layout','Grid layout','Change layout','View options','Grid options','Tile layout']){
    const b=page.locator(`button[aria-label="${al}"]`).first();
    if(await b.count()){ await b.click().catch(()=>{}); out.opened=al; await page.waitForTimeout(2200); break; }
  }
  if(!out.opened){
    // fall back: the second-to-last toolbar icon
    const t=(out.toolbar||[]).find(b=>/grid|layout|tile|view/i.test(b.al));
    if(t){ await page.mouse.click(t.x+16,t.y+16); out.opened='coord:'+t.al; await page.waitForTimeout(2200); }
  }
  out.menu = await page.evaluate((vs)=>{const vis=eval(vs);
    return { items:[...new Set([...document.querySelectorAll('[role="menuitem"],[role="dialog"] button,[role="menu"] *')].filter(vis)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<40))].slice(0,14),
      dialogTxt:([...document.querySelectorAll('[role="dialog"]')].filter(vis).pop()?.innerText||'').replace(/\s+/g,' ').slice(0,300) };},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/layout-menu.png'});
  return out;
};
