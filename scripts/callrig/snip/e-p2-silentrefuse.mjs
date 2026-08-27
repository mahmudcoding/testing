import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVis = `const bv = el => { const r=el.getBoundingClientRect(); if(r.width<180||r.height<100) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  // Files: upload dialog with nothing chosen — does the Upload button explain itself?
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.getByRole('button',{name:'Upload'}).first().click();
  await page.waitForTimeout(3000);
  out.uploadDialog = await page.evaluate(`(() => { ${boxVis} ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(bv).pop();
     if(!d) return {open:false};
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const btns=[...d.querySelectorAll('button')].filter(vis)
       .map(b=>({tx:(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,22), dis:b.disabled, ad:b.getAttribute('aria-disabled')}));
     return {open:true, text:t.slice(0,160), buttons:btns.slice(0,6)}; })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  // Privacy: Block with nothing selected (already known disabled) — confirm it EXPLAINS or is disabled
  await page.goto(BASE+'/w/'+WS+'/settings/privacy', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.blockSection = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     const i=t.indexOf('Blocked users');
     const b=[...m.querySelectorAll('button')].find(x=>/^Block$/.test((x.innerText||'').trim()));
     return {section:t.slice(i,i+150), buttonDisabled:b?b.disabled:null}; })()`);
  return out;
};
