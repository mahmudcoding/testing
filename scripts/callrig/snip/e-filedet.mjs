export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const pos = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const b=[...document.querySelectorAll('main button')].filter(vis).filter(x=>/More actions/.test(x.getAttribute('aria-label')||''));
    if(!b.length) return {none:true};
    const r=b[b.length-1].getBoundingClientRect();
    return {x:r.left+r.width/2, y:r.top+r.height/2, count:b.length};
  });
  if(pos.none) return {pos};
  await page.mouse.click(pos.x,pos.y);
  await page.waitForTimeout(2200);
  return {pos, menu: await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper]')].filter(vis);
    return {n:m.length, items:m.flatMap(x=>[...x.querySelectorAll('[role=menuitem],button')].filter(vis)
      .map(i=>i.innerText.replace(/\n/g,' ').trim()).filter(Boolean)).slice(0,12)};
  })};
};
