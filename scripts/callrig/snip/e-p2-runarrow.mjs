import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  const setLang = async (want, optionRe) => {
    await page.goto(BASE+'/w/'+WS+'/settings/account', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8500);
    const t = await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
         .find(x=>/^(English|Русский|Английский)/.test((x.textContent||'').trim()));
       if(!b) return {none:true}; const r=b.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(t.none) return 'trigger missing';
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(3000);
    const o = await page.evaluate(`(() => { ${VISFN}
       const els=[...document.querySelectorAll('[role=option],[role=menuitem],[data-state=open] button')].filter(vis)
         .filter(x=>${optionRe}.test((x.textContent||'').trim()));
       if(!els.length) return {none:true}; const r=els[0].getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(o.none){ await page.keyboard.press('Escape'); return 'option missing'; }
    await page.mouse.move(o.cx,o.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(7000);
    return await page.evaluate(`(() => document.documentElement.lang)()`);
  };
  const scan = `(() => { ${VISFN}
     const strict=el=>{const r=el.getBoundingClientRect(); if(r.width<24||r.height<10) return false; return vis(el);};
     const de=document.documentElement; const m=document.querySelector('main')||document.body;
     const leaves=[...m.querySelectorAll('*')].filter(el=>el.children.length===0 && strict(el));
     const clipped=leaves.filter(el=>el.scrollWidth>el.clientWidth+1 && el.clientWidth>=24)
       .map(el=>((el.textContent||'').replace(/\\s+/g,' ').trim().slice(0,30))+' ['+el.clientWidth+'<'+el.scrollWidth+']'
             +(/truncate/.test(String(el.className||''))?' (truncate)':' (NO truncate)'));
     const pageWider=de.scrollWidth>de.clientWidth;
     const off=[...m.querySelectorAll('button,a[href],input')].filter(strict)
       .filter(el=>el.getBoundingClientRect().left>=innerWidth)
       .map(el=>(el.getAttribute('aria-label')||el.textContent||'').trim().slice(0,26));
     return {pageScrollsX:pageWider, docW:de.scrollWidth,
             clipped:[...new Set(clipped)].slice(0,8),
             unreachable: pageWider?'(page scrolls)':off.slice(0,5)}; })()`;
  out.toRu = await setLang('ru','/^(Russian|Русский)$/');
  await page.setViewportSize({width:1280, height:800});
  for (const [path,label] of [['/w/'+WS+'/directories?tab=people','directories'],
                              ['/w/'+WS+'/calendar','calendar'],
                              ['/w/'+WS+'/files','files'],
                              ['/w/'+WS+'/c/C4QEGENERAL0001','channel']]) {
    await page.goto(BASE+path,{waitUntil:'domcontentloaded'}); await page.waitForTimeout(8000);
    out[label]=await page.evaluate(scan);
  }
  await page.setViewportSize({width:1920, height:1080});
  out.backToEn = await setLang('en','/^(English|Английский)$/');
  return out;
};
