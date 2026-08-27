import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVis = `const bv = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  // meeting form with an EMPTY title — does it say why, or just refuse?
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3800);
  const posts=[];
  page.on('request', r=>{ if(/\/api\/v1\/calendar\/meetings/.test(r.url())&&r.method()==='POST') posts.push(1); });
  out.emptyTitleBefore = await page.evaluate(`(() => { ${boxVis} ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const i=d.querySelector('input[data-field="event-title"]')||d.querySelector('input[type=text]');
     const sub=[...d.querySelectorAll('button')].filter(vis).find(b=>/^Schedule meeting$/.test((b.innerText||'').trim()));
     return {titleValue:i?String(i.value):null, submitDisabled:sub?sub.disabled:null,
             ariaDis:sub?sub.getAttribute('aria-disabled'):null}; })()`);
  const sub = page.locator('button').filter({hasText:/^Schedule meeting$/}).last();
  const b = await sub.boundingBox();
  posts.length=0;
  if(b){ await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); }
  await page.waitForTimeout(5000);
  out.emptyTitleAfter = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     if(!d) return {dialogClosed:true};
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {dialogClosed:false, hasMessage:/required|обязат|enter a|введите|Title/i.test(t),
             tail:t.slice(-130)}; })()`);
  out.postFired = posts.length>0;
  await page.keyboard.press('Escape');
  return out;
};
