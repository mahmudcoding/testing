import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const em = process.env.QA_EMOJI || '🎉';
  const out={net:[]};
  page.on('response', async r=>{ if(!/\/api\/v1\//.test(r.url()))return; if(r.request().method()==='GET')return;
    let b=null; try{b=(await r.text()).slice(0,140);}catch(e){}
    out.net.push({m:r.request().method(),s:r.status(),u:r.url().replace(/^https:\/\/[^/]+/,''),body:b}); });
  out.state = await page.evaluate(([e,v])=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role="menu"],[role="dialog"],[data-radix-popper-content-wrapper]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    if(!m) return {err:'popover gone'};
    const b=[...m.querySelectorAll('button')].filter(vis).find(x=>(x.textContent||'').trim()===e);
    if(!b) return {err:'emoji gone', have:[...m.querySelectorAll('button')].filter(vis).map(x=>(x.textContent||'').trim()).slice(0,8)};
    const dis=b.disabled; b.click(); return {clicked:true, disabled:dis}; }, [em, VIS]);
  await page.waitForTimeout(5000);
  out.notes = await page.evaluate((v)=>{const vis=eval(v);
    return [...document.querySelectorAll('*')].filter(e=>!e.childElementCount).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>t.length<70 && /reaction|disabled|not allowed|error/i.test(t)).slice(0,5);}, VIS);
  return out;
};
