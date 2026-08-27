export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(8000);
  const mark=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const c=[...document.querySelectorAll('button,a,[role="button"]')].filter(vis)
      .filter(b=>/Message requests/i.test((b.getAttribute('aria-label')||'')+' '+(b.textContent||'')));
    if(!c.length) return null;
    c[0].setAttribute('data-qa-req','1'); return true;});
  if(!mark) return {err:'control not found'};
  const snap=()=>page.evaluate(()=>{
    const b=document.querySelector('[data-qa-req="1"]');
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const side=[...document.querySelectorAll('nav *, aside *')].filter(e=>e.children.length===0).filter(vis)
      .filter(e=>e.getBoundingClientRect().x<340)
      .map(e=>(e.textContent||'').trim()).filter(Boolean);
    const r=b?b.getBoundingClientRect():null;
    return {expanded:b&&b.getAttribute('aria-expanded'), pressed:b&&b.getAttribute('aria-pressed'),
      label:b&&(b.getAttribute('aria-label')||b.textContent.trim()).slice(0,26),
      rect:r?[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]:null,
      sidebarCount:side.length, sidebarTail:side.slice(-8),
      dialogs:document.querySelectorAll('[role="dialog"]').length,
      poppers:document.querySelectorAll('[data-radix-popper-content-wrapper]').length,
      active:document.activeElement? (document.activeElement.getAttribute('aria-label')||document.activeElement.tagName):null};
  });
  out.before=await snap();
  out.hitTest=await page.evaluate(()=>{
    const b=document.querySelector('[data-qa-req="1"]'); const r=b.getBoundingClientRect();
    const hit=document.elementFromPoint(Math.round(r.x+r.width/2), Math.round(r.y+r.height/2));
    return {tag:hit&&hit.tagName, inside: !!(hit&&b.contains(hit))};});
  await page.locator('[data-qa-req="1"]').click();
  const s=[]; for(let i=0;i<10;i++){ await page.waitForTimeout(450); s.push(await snap()); }
  out.afterFirst=s[0]; out.afterLast=s.at(-1);
  out.sidebarChanged=s.some(x=>x.sidebarCount!==out.before.sidebarCount);
  out.anyPopup=s.some(x=>x.dialogs>0||x.poppers>0);
  return out;
};
