import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const tid = process.env.QA_TID || 'meeting-settings-video-quality-slider';
  const out = {net:[]};
  page.on('response', async (r)=>{ if(r.request().method()==='GET') return;
    if(!/meeting/i.test(r.url())) return;
    let b=null; try{b=(await r.text()).slice(0,240);}catch(e){b='<no body>';}
    out.net.push({m:r.request().method(), s:r.status(), u:r.url().replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'').slice(0,160), body:b}); });
  out.before = await page.evaluate((t)=>{ const el=document.querySelector('[data-testid="'+t+'"]');
    return el?{min:el.min,max:el.max,step:el.step,value:el.value,al:el.getAttribute('aria-label'),
               txt:(el.getAttribute('aria-valuetext')||null)}:{err:'not found'}; }, tid);
  if (out.before.err) return out;
  const target = process.env.QA_VAL || out.before.min;
  await page.focus('[data-testid="'+tid+'"]');
  // drive with keyboard so React sees real interaction
  for (let i=0;i<12;i++) { await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(120); }
  await page.waitForTimeout(4000);
  out.after = await page.evaluate((t)=>{ const el=document.querySelector('[data-testid="'+t+'"]');
    return el?{value:el.value, txt:(el.getAttribute('aria-valuetext')||null)}:{err:'gone'}; }, tid);
  out.panelTxt = await page.evaluate(()=>{ const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const t=(p?p.innerText:'').replace(/\s+/g,' '); const i=t.indexOf('MAXIMUM VIDEO QUALITY');
    return i>=0? t.slice(i, i+140) : t.slice(0,140); });
  return out;
}
