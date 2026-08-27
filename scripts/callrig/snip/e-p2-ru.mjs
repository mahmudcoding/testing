import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/settings/account', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const pick = async lang => {
    const t = await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
         .find(x=>/^(Language|Язык|English|Русский|Russian)/.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
       if(!b) return {none:true}; const r=b.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(t.none) return 'control not found';
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(2800);
    const o = await page.evaluate(`(() => { ${VISFN}
       const els=[...document.querySelectorAll('[role=option],[role=menuitem],[data-state=open] button')].filter(vis)
         .filter(x=>new RegExp('^'+${JSON.stringify(lang)}+'$').test((x.textContent||'').trim()));
       if(!els.length) return {none:true}; const r=els[0].getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(o.none) { await page.keyboard.press('Escape'); return 'option '+lang+' not found'; }
    await page.mouse.move(o.cx,o.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(6000);
    return 'switched';
  };
  out.toRussian = await pick(process.env.QA_LANG||'Russian');
  const scan = `(() => { ${VISFN}
     const strict=el=>{const r=el.getBoundingClientRect(); if(r.width<24||r.height<10) return false; return vis(el);};
     const m=document.querySelector('main')||document.body;
     const leaves=[...m.querySelectorAll('*')].filter(el=>el.children.length===0 && strict(el));
     const isData = t => /^[#@]?qa[-_.]/i.test(t) || /^QA /.test(t) || /\\.(png|txt|jpg|pdf|webp)$/i.test(t)
        || /^\\d/.test(t) || /GMT|\\+05|^[A-Z]{2,3}$/.test(t) || /^[\\d\\s:.,–-]+$/.test(t)
        || /seam-|viewer|normal|seam|fake|ws2-only|aaaa/i.test(t);
     const latin=[...new Set(leaves.map(el=>(el.textContent||'').replace(/\\s+/g,' ').trim())
       .filter(t=>t.length>1 && t.length<70 && /[A-Za-z]{3}/.test(t) && !/[А-Яа-яЁё]/.test(t))
       .filter(t=>!isData(t)))];
     const clipped=leaves.filter(el=>el.scrollWidth>el.clientWidth+1 && el.clientWidth>=24)
       .map(el=>((el.textContent||'').replace(/\\s+/g,' ').trim().slice(0,40))+' ['+el.clientWidth+'<'+el.scrollWidth+']');
     const offscreen=leaves.filter(el=>{const r=el.getBoundingClientRect();
        return r.left>=innerWidth || r.right<=0;}).length;
     return {latinCopy:latin.slice(0,12), clipped:[...new Set(clipped)].slice(0,8),
             offscreen, pageScrollsX: document.documentElement.scrollWidth>document.documentElement.clientWidth}; })()`;
  const screens=[['/w/'+WS+'/directories?tab=people','directories'],
                 ['/w/'+WS+'/calendar','calendar'],
                 ['/w/'+WS+'/files','files']];
  for(const [path,label] of screens){
    await page.goto(BASE+path,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(9000);
    out[label]=await page.evaluate(scan);
  }
  return out;
};
