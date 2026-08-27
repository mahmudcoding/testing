import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600);
  await page.keyboard.type('probe'); await page.waitForTimeout(4500);
  const t = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^See all in Messages$/.test((x.innerText||'').trim()));
     const r=b.getBoundingClientRect(); return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
  await page.waitForTimeout(4000);
  const count = `(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const all=[...d.querySelectorAll('[role=option]')];
     // find the scrolling container inside the dialog
     const sc=[d,...d.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+30)
       .map(e=>({tag:e.tagName, sh:e.scrollHeight, ch:e.clientHeight, top:Math.round(e.scrollTop)}));
     return {optionsAll:all.length, optionsVisible:all.filter(vis).length,
             scrollers:sc.slice(0,3),
             lastText:all.length?(all[all.length-1].innerText||'').replace(/\\s+/g,' ').slice(0,40):null}; })()`;
  const before = await page.evaluate(count);
  // scroll the inner container to the bottom repeatedly (virtualised lists load more)
  for(let i=0;i<6;i++){
    await page.evaluate(`(() => {
       const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
       const sc=[d,...d.querySelectorAll('*')].find(e=>e.scrollHeight>e.clientHeight+30);
       if(sc) sc.scrollTop = sc.scrollHeight; })()`);
    await page.waitForTimeout(1400);
  }
  const after = await page.evaluate(count);
  return {before, after};
};
