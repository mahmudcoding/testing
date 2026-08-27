import { VIS } from './a-nb-lib.mjs';
// Set one device row in the Device permissions dialog and save.
// QA_DEV = Microphone|Camera|Screen sharing ; QA_MODE = Inherit|Allow|Block
export default async ({page}) => {
  const dev = process.env.QA_DEV || 'Camera';
  const mode = process.env.QA_MODE || 'Block';
  const out = {dev, mode, net:[]};
  page.on('response', async (r)=>{ if(r.request().method()==='GET') return;
    if(!/participants|permission/i.test(r.url())) return;
    let b=null; try{b=(await r.text()).slice(0,240);}catch(e){b='<no body>';}
    out.net.push({m:r.request().method(), s:r.status(), u:r.url().replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'').slice(0,200), body:b}); });
  out.set = await page.evaluate(([d,m,v])=>{ const vis=eval(v);
    const dlg=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .find(x=>x.querySelector('[data-testid="device-permissions-save"]'));
    if(!dlg) return {err:'no device dialog'};
    // find the section whose text starts with the device name
    const rows=[...dlg.querySelectorAll('*')].filter(vis)
      .filter(e=>{const t=(e.innerText||'').trim(); return t.startsWith(d) && t.length<90 &&
        [...e.querySelectorAll('button')].some(b=>/^(Inherit|Allow|Block)$/.test((b.innerText||'').trim()));})
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    if(!rows[0]) return {err:'no row for '+d};
    const btn=[...rows[0].querySelectorAll('button')].filter(vis).find(b=>(b.innerText||'').trim()===m);
    if(!btn) return {err:'no mode '+m};
    btn.click();
    return {ok:true, rowTxt:(rows[0].innerText||'').replace(/\s+/g,' ').slice(0,80)};
  }, [dev, mode, VIS]);
  if (out.set.err) return out;
  await page.waitForTimeout(700);
  await page.click('[data-testid="device-permissions-save"]');
  await page.waitForTimeout(5000);
  return out;
}
