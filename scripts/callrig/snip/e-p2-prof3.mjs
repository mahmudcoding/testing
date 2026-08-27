import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/settings/profile`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const ctrls = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    // label each input by the nearest preceding text
    const ins=[...m.querySelectorAll('input')].filter(vis).map((e,i)=>{
      let n=e, lbl='';
      for(let k=0;k<5&&n;k++){ n=n.parentElement; if(n){ const t=(n.innerText||'').split('\n')[0].trim(); if(t&&t.length<40){lbl=t;break;} } }
      e.setAttribute('data-qa-i',String(i));
      return {i, lbl, v:e.value};
    });
    const btns=[...m.querySelectorAll('button')].filter(vis).map((e,i)=>({i,
      txt:(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,24), type:e.type, dis:e.disabled}));
    return {inputs:ins, buttons:btns.filter(b=>b.txt)};
  });
  return ctrls;
};
