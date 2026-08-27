import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600);
  await page.keyboard.type('probe'); await page.waitForTimeout(5500);
  const t = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const b=[...d.querySelectorAll('[role=tab]')].filter(vis).find(x=>/^Messages/.test((x.innerText||'').trim()));
     const r=b.getBoundingClientRect(); return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
  await page.waitForTimeout(4000);
  // scroll to the bottom, then enumerate EVERY interactive node in the dialog with no text filter
  for(let i=0;i<4;i++){
    await page.evaluate(`(() => {
       const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
       const sc=[d,...d.querySelectorAll('*')].find(e=>e.scrollHeight>e.clientHeight+30);
       if(sc) sc.scrollTop = sc.scrollHeight; })()`);
    await page.waitForTimeout(1500);
  }
  return await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const all=[...d.querySelectorAll('button,a,[role=tab],[role=option],input,select,[tabindex]')]
       .map(e=>({tag:e.tagName, role:e.getAttribute('role')||'',
                 tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,26),
                 al:(e.getAttribute('aria-label')||'').slice(0,26), vis:vis(e)?1:0}));
     const nonOption=all.filter(e=>e.role!=='option');
     const tail=(d.innerText||'').replace(/\\s+/g,' ').slice(-160);
     return {rows:all.filter(e=>e.role==='option').length,
             nonOptionControls:[...new Map(nonOption.map(e=>[e.tx+e.al,e])).values()].slice(0,14),
             dialogTailText:tail}; })()`);
};
