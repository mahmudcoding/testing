import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/settings/account', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.htmlLangBefore = await page.evaluate(`(() => document.documentElement.lang||'(unset)')()`);
  const t = await page.evaluate(`(() => { ${VISFN}
     const btns=[...document.querySelector('main').querySelectorAll('button')].filter(vis);
     const b=btns.find(x=>/^(English|Русский|Russian|Ozbek|O'zbek)/.test((x.textContent||'').trim()));
     if(!b) return {none:true, sample:btns.map(x=>(x.textContent||'').trim().slice(0,22)).slice(-10)};
     const r=b.getBoundingClientRect();
     return {label:(b.textContent||'').trim().slice(0,24), cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.trigger=t; if(t.none) return out;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
  await page.mouse.down(); await page.waitForTimeout(140); await page.mouse.up();
  await page.waitForTimeout(3200);
  out.options = await page.evaluate(`(() => { ${VISFN}
     return [...new Set([...document.querySelectorAll('[role=option],[role=menuitem],[data-state=open] button')].filter(vis)
       .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim()).filter(x=>x&&x.length<30))].slice(0,8); })()`);
  const o = await page.evaluate(`(() => { ${VISFN}
     const els=[...document.querySelectorAll('[role=option],[role=menuitem],[data-state=open] button')].filter(vis)
       .filter(x=>/^(English|Английский)$/.test((x.textContent||'').trim()));
     if(!els.length) return {none:true}; const r=els[0].getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.englishOption=o;
  if(!o.none){ await page.mouse.move(o.cx,o.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(140); await page.mouse.up(); await page.waitForTimeout(7000); }
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(8000);
  out.htmlLangAfter = await page.evaluate(`(() => document.documentElement.lang||'(unset)')()`);
  out.sampleText = await page.evaluate(`(() => ((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ').slice(0,120))()`);
  return out;
};
