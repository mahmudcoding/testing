export default async ({page}) => {
  const out={};
  out.all = await page.evaluate(()=>[...document.querySelectorAll('button')]
    .filter(b=>/ute notification/i.test(b.getAttribute('aria-label')||''))
    .map(b=>{const r=b.getBoundingClientRect();
      let path=[],n=b; for(let i=0;i<4&&n;i++){n=n.parentElement; if(n)path.push(n.tagName+'.'+String(n.className||'').split(' ')[0].slice(0,18));}
      return {label:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed'),
        disabled:b.disabled, rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
        pe:getComputedStyle(b).pointerEvents, path};}));
  const b=page.locator('button[aria-label="Mute notifications"]').first();
  const box=await b.boundingBox();
  out.hitTest = await page.evaluate(([x,y])=>{
    const e=document.elementFromPoint(x,y);
    return {tag:e&&e.tagName, label:e&&e.closest('button')&&e.closest('button').getAttribute('aria-label')};
  }, [box.x+box.width/2, box.y+box.height/2]);
  await b.click();
  await page.waitForTimeout(600);
  out.afterMouse = await page.evaluate(()=>({
    active: document.activeElement && (document.activeElement.getAttribute('aria-label')||document.activeElement.tagName),
    label: (document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]')||{}).ariaLabel
  }));
  // keyboard activation, a different input path
  const reqs=[];
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET') reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,50)); };
  page.on('request', onReq);
  await b.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  out.afterEnter = await page.evaluate(()=>{const e=document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]');
    return {label:e&&e.getAttribute('aria-label'), pressed:e&&e.getAttribute('aria-pressed')};});
  await page.keyboard.press('Space'); await page.waitForTimeout(900);
  out.afterSpace = await page.evaluate(()=>{const e=document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]');
    return {label:e&&e.getAttribute('aria-label'), pressed:e&&e.getAttribute('aria-pressed')};});
  page.off('request', onReq);
  out.reqs=reqs;
  return out;
};
