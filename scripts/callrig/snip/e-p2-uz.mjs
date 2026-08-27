import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  const setLang = async optionRe => {
    await page.goto(BASE+'/w/'+WS+'/settings/account', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8500);
    const t = await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
         .find(x=>/^(English|Русский|Английский|O'zbek|Ozbek|Inglizcha|Ўзбек)/i.test((x.textContent||'').trim()));
       if(!b) return {none:true}; const r=b.getBoundingClientRect();
       return {cur:(b.textContent||'').trim().slice(0,20), cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(t.none) return 'trigger missing';
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(3000);
    const opts = await page.evaluate(`(() => { ${VISFN}
       return [...new Set([...document.querySelectorAll('[role=option],[role=menuitem],[data-state=open] button')].filter(vis)
         .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim()).filter(x=>x&&x.length<30))].slice(0,8); })()`);
    const o = await page.evaluate(`(() => { ${VISFN}
       const els=[...document.querySelectorAll('[role=option],[role=menuitem],[data-state=open] button')].filter(vis)
         .filter(x=>${optionRe}.test((x.textContent||'').trim()));
       if(!els.length) return {none:true}; const r=els[0].getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(o.none){ await page.keyboard.press('Escape'); return {err:'option missing', opts}; }
    await page.mouse.move(o.cx,o.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(7000);
    return {lang: await page.evaluate(`(() => document.documentElement.lang)()`), opts};
  };
  out.toUzbek = await setLang('/Uzbek|O.zbek|Ўзбек/i');
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.locator('button[aria-label]').filter({hasText:''}).first().waitFor({timeout:5000}).catch(()=>{});
  const bell = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis)
       .find(x=>/notification|уведомл|bildirish/i.test(x.getAttribute('aria-label')||''));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {label:b.getAttribute('aria-label'), cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.bellBtn=bell;
  if(!bell.none){
    await page.mouse.move(bell.cx,bell.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(3500);
    out.panel = await page.evaluate(`(() => { ${VISFN}
       const c=[...document.querySelectorAll('[role=dialog],[data-state=open],aside')]
         .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>150;});
       const d=c.pop(); if(!d) return '(none)';
       return (d.innerText||'').replace(/\\s+/g,' ').slice(0,260); })()`);
  }
  out.backToEn = await setLang('/^(English|Inglizcha|Английский|Ingliz)/i');
  return out;
};
