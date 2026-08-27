import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/settings/appearance', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  out.appearanceButtons = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main'); const nav=m.querySelector('nav');
     return [...m.querySelectorAll('button')].filter(n=>vis(n)&&(!nav||!nav.contains(n)))
       .map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim())
       .filter(Boolean).slice(0,28); })()`);
  out.appearanceTailText = await page.evaluate(`(() => {
     const t=((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ');
     return t.slice(-260); })()`);
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  out.reminderArea = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const i=t.toLowerCase().indexOf('reminder');
     return t.slice(Math.max(0,i-40), i+160); })()`);
  out.reminderControls = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return [...d.querySelectorAll('button,select,[role=combobox],[role=radio]')].filter(vis)
       .map(b=>b.tagName.toLowerCase()+' "'+((b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,30))+'"')
       .filter(x=>/reminder|minute|hour|No rem/i.test(x)).slice(0,10); })()`);
  await page.keyboard.press('Escape');
  return out;
};
