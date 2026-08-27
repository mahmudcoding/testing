import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3500);
  const ti = page.locator('input[data-field="event-title"]').first();
  out.titleAttrs = await page.evaluate(`(() => { const i=document.querySelector('input[data-field="event-title"]');
     return {maxlength:i.getAttribute('maxlength'), required:i.required, type:i.type}; })()`);
  const cases = {
    long:  'Q'.repeat(500),
    unicode: 'встреча 会議 اجتماع 🌴🔥 ĄŽŠ',
    spaces: '     ',
    html:  '<script>x</script> & <b>bold</b>',
  };
  out.cases={};
  for (const [k,v] of Object.entries(cases)) {
    await ti.fill(''); await page.waitForTimeout(300);
    await ti.fill(v); await page.waitForTimeout(900);
    out.cases[k] = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
       const i=document.querySelector('input[data-field="event-title"]');
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
       const submit=[...d.querySelectorAll('button')].filter(vis)
         .find(b=>/^Schedule meeting$/.test((b.textContent||'').trim()));
       const t=(d.innerText||'').replace(/\\s+/g,' ');
       return { accepted:String(i.value).length, valid:i.checkValidity(),
                submitDisabled: submit? submit.disabled : '(no submit)',
                validationMsg:(t.match(/(required|too long|invalid|обязат)[^.]{0,40}/i)||[''])[0] }; })()`);
  }
  return out;
};
