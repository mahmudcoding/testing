import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<60) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const strict=`const strict=el=>{const r=el.getBoundingClientRect(); if(r.width<24||r.height<10) return false;
     let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
       if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01;};`;
  // 1. any visible hint text mentioning a shortcut, composer NOT focused
  out.hintsBlurred = await page.evaluate(`(() => { ${strict}
     const m=document.querySelector('main');
     return [...new Set([...m.querySelectorAll('*')].filter(strict)
       .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim())
       .filter(t=>t.length<110 && /(⌘|Cmd|Ctrl|Enter to send|Shift\\+Enter)/i.test(t)))].slice(0,6); })()`);
  // 2. focus the composer, then look again
  await page.locator('div[contenteditable="true"][aria-label="Compose message"]').first().click();
  await page.waitForTimeout(1500);
  out.hintsFocused = await page.evaluate(`(() => { ${strict}
     const m=document.querySelector('main');
     return [...new Set([...m.querySelectorAll('*')].filter(strict)
       .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim())
       .filter(t=>t.length<110 && /(⌘|Cmd|Ctrl|Enter to send|Shift\\+Enter)/i.test(t)))].slice(0,6); })()`);
  out.focusNow = await page.evaluate(`(() => { const a=document.activeElement;
     return a? a.tagName+'['+(a.getAttribute('aria-label')||'')+']':'(none)'; })()`);
  // 3. what does Help say, verbatim?
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis)
       .find(x=>/Help/i.test(x.getAttribute('aria-label')||''));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t.none){
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(3500);
    out.helpMenu = await page.evaluate(`(() => { ${VISFN}
       return [...new Set([...document.querySelectorAll('[role=menuitem],[role=menu] button')].filter(vis)
         .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim()).filter(Boolean))].slice(0,10); })()`);
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
       clickDeepest(document.querySelector('[role=menu]')||document.body, /Keyboard|Shortcut/i); })()`);
    await page.waitForTimeout(3500);
    out.helpDialog = await page.evaluate(`(() => { ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
       return d? (d.innerText||'').replace(/\\s+/g,' ').slice(0,400):'(no dialog)'; })()`);
  }
  return out;
};
