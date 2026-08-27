export default async ({page}) => {
  const pos = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const i=[...document.querySelectorAll('[role=menuitem],[role=menu] button')].filter(vis).find(x=>/View details/.test(x.innerText));
    if(!i) return {none:true}; const r=i.getBoundingClientRect();
    return {x:r.left+r.width/2,y:r.top+r.height/2};
  });
  if(pos.none) return {pos};
  await page.mouse.click(pos.x,pos.y);
  await page.waitForTimeout(2800);
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog]');
    const scope=d||document.querySelector('main');
    return {isDialog:!!d, txt:scope.innerText.replace(/\n{2,}/g,' | ').slice(-420),
      btns:[...scope.querySelectorAll('button,a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText).replace(/\n/g,' ').trim()).filter(Boolean).slice(-10)};
  });
};
