import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVis = `const bv = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  // settings switches were verified to track aria-checked earlier; compare with the meeting form's
  await page.goto(BASE+'/w/'+WS+'/settings/appearance', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.settingsSwitches = await page.evaluate(`(() => {
     return [...document.querySelector('main').querySelectorAll('[role=switch]')]
       .map(e=>({checked:e.getAttribute('aria-checked'), tag:e.tagName})).slice(0,6); })()`);
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3800);
  out.meetingFormControls = await page.evaluate(`(() => { ${boxVis} ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const sw=[...d.querySelectorAll('[role=switch],input[type=checkbox],[role=radio]')]
       .map(e=>{ let n=e,ctx='';
         for(let k=0;k<5&&n;k++){ n=n.parentElement;
           if(n){const s=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(s.length>6&&s.length<70){ctx=s.slice(0,40);break;}}}
         return {tag:e.tagName, role:e.getAttribute('role')||'', checked:e.getAttribute('aria-checked'),
                 nativeChecked:e.checked===undefined?null:e.checked, ctx};});
     return sw.slice(0,8); })()`);
  await page.keyboard.press('Escape');
  return out;
};
