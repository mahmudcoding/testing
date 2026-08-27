const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    if(!d) return {noDialog:true};
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,420),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>({al:(b.getAttribute('aria-label')||'').slice(0,26),t:(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26),exp:b.getAttribute('aria-expanded')})),
      participantRows:[...d.querySelectorAll('*')].filter(e=>vis(e)&&/QA (Alice|Bob|Carol)/.test(e.innerText||'')&&e.children.length<=3).length };},VS);
  out.initial = await read();
  // try the collapse toggle
  const toggle = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    const b=[...d.querySelectorAll('button')].filter(vis).find(b=>b.getAttribute('aria-expanded')!==null || /participants/i.test(b.innerText||''));
    if(!b) return null; const r=b.getBoundingClientRect();
    return {label:(b.innerText||b.getAttribute('aria-label')||'').trim().slice(0,26), exp:b.getAttribute('aria-expanded'), x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)};},VS);
  out.toggle=toggle;
  if(toggle){ await page.mouse.click(toggle.x,toggle.y); await page.waitForTimeout(1500); out.afterToggle = await read(); }
  // now the close control
  const close = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    const b=[...d.querySelectorAll('button')].filter(vis).find(b=>/close|done|dismiss/i.test((b.getAttribute('aria-label')||'')+(b.innerText||'')));
    if(!b) return null; const r=b.getBoundingClientRect();
    return {label:(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,24), x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)};},VS);
  out.closeControl=close;
  if(close){ await page.mouse.click(close.x,close.y); await page.waitForTimeout(2500); out.afterClose = await read(); }
  return out;
};
