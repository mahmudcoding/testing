import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVis = `const bv = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3800);
  const dump = `(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const i=d.querySelector('input[data-field="event-title"]')||d.querySelector('input[type=text]');
     return {full:t.slice(0,420), titleValue:i?String(i.value):null,
             titleAria:i?{invalid:i.getAttribute('aria-invalid'), desc:i.getAttribute('aria-describedby'), req:i.getAttribute('required')}:null}; })()`;
  out.before = await page.evaluate(dump);
  const sub = page.locator('button').filter({hasText:/^Schedule meeting$/}).last();
  const b = await sub.boundingBox();
  if(b){ await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); }
  await page.waitForTimeout(5000);
  out.after = await page.evaluate(dump);
  out.diff = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     // anything that looks like a validation message anywhere in the dialog
     const reds=[...d.querySelectorAll('*')].filter(e=>{
       const cs=getComputedStyle(e); const c=cs.color;
       const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join('');
       return own.length>2 && /rgb\\(2[0-9][0-9],\\s*[0-9]{1,2},/.test(c);
     }).map(e=>(e.textContent||'').trim().slice(0,50));
     return {redTexts:[...new Set(reds)].slice(0,5),
             focusedNow:document.activeElement?document.activeElement.tagName+'/'+(document.activeElement.getAttribute('data-field')||''):null}; })()`);
  await page.keyboard.press('Escape');
  return out;
};
