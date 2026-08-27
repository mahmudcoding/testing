import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/settings/account', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.lang = await page.evaluate(`(() => document.documentElement.lang)()`);
  out.buttons = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main'); const nav=m.querySelector('nav');
     return [...m.querySelectorAll('button')].filter(n=>vis(n)&&(!nav||!nav.contains(n)))
       .map((b,i)=>i+' "'+((b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,34))+'"'); })()`);
  // the language control is the one whose label is a language name in any of the four
  const t = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main'); const nav=m.querySelector('nav');
     const b=[...m.querySelectorAll('button')].filter(n=>vis(n)&&(!nav||!nav.contains(n)))
       .find(x=>/^(English|Ingliz|Inglizcha|Русский|Английский|O.zbek|Ўзбек|Uzbek|Rus|Ruscha)/i.test((x.textContent||'').trim()));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cur:(b.textContent||'').trim().slice(0,24), cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.trigger=t;
  if(!t.none){
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(3200);
    out.options = await page.evaluate(`(() => { ${VISFN}
       return [...new Set([...document.querySelectorAll('[role=option],[role=menuitem],[data-state=open] button')].filter(vis)
         .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim()).filter(x=>x&&x.length<30))].slice(0,8); })()`);
    const o = await page.evaluate(`(() => { ${VISFN}
       const els=[...document.querySelectorAll('[role=option],[role=menuitem],[data-state=open] button')].filter(vis)
         .filter(x=>/^(English|Ingliz|Inglizcha|Английский)/i.test((x.textContent||'').trim()));
       if(!els.length) return {none:true}; const r=els[0].getBoundingClientRect();
       return {txt:(els[0].textContent||'').trim(), cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    out.englishOption=o;
    if(!o.none){ await page.mouse.move(o.cx,o.cy); await page.waitForTimeout(300);
      await page.mouse.down(); await page.waitForTimeout(140); await page.mouse.up(); await page.waitForTimeout(7000); }
    else await page.keyboard.press('Escape');
  }
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(8000);
  out.langAfter = await page.evaluate(`(() => document.documentElement.lang)()`);
  out.sample = await page.evaluate(`(() => ((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ').slice(0,110))()`);
  return out;
};
