import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVis = `const bv = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('request', r=>{ if(/\/api\/v1\/calendar\/meetings/.test(r.url())&&r.method()==='POST')
    posts.push((r.postData()||'').slice(0,200)); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3800);
  await page.locator('input[data-field="event-start-time"]').first().fill('14:00');
  await page.waitForTimeout(1000);
  await page.locator('input[data-field="event-end-time"]').first().fill('09:00');
  await page.waitForTimeout(1800);
  await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const i=d.querySelector('input[data-field="event-title"]')||d.querySelector('input[type=text]');
     const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
     s.call(i,'E2 invalid range probe'); i.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  await page.waitForTimeout(900);
  out.beforeSubmit = await page.evaluate(`(() => { ${boxVis} ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const sub=[...d.querySelectorAll('button')].filter(vis).find(b=>/^Schedule meeting$/.test((b.innerText||'').trim()));
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {submitDisabled: sub?sub.disabled:null, ariaDisabled: sub?sub.getAttribute('aria-disabled'):null,
             summaryPresent: /\\d{1,2}:\\d{2}\\s*(AM|PM)?\\s*–/.test(t),
             tail:t.slice(-120)}; })()`);
  posts.length=0;
  const sub = page.locator('button').filter({hasText:/^Schedule meeting$/}).last();
  const b = await sub.boundingBox();
  if(b){ await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(220);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); }
  await page.waitForTimeout(6000);
  out.posted = posts.slice(0,1);
  out.afterSubmit = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     if(!d) return {dialogClosed:true};
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {dialogClosed:false, tail:t.slice(-150)}; })()`);
  await page.keyboard.press('Escape');
  return out;
};
