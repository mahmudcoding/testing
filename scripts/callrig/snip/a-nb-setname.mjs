import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const name = process.env.QA_NEWNAME || 'RENAMED-BY-ADMIN';
  const out = {net:[]};
  page.on('response', async (r)=>{ if(r.request().method()==='GET') return;
    if(!/meeting/i.test(r.url())) return;
    let b=null; try{b=(await r.text()).slice(0,250);}catch(e){b='<no body>';}
    out.net.push({m:r.request().method(), s:r.status(), u:r.url().replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'').slice(0,200), body:b}); });
  out.typed = await page.evaluate(([n,v])=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return {err:'no panel'};
    const inputs=[...p.querySelectorAll('input')].filter(vis).filter(i=>i.type==='text'||!i.type);
    if(!inputs.length) return {err:'no text input', all:[...p.querySelectorAll('input')].map(i=>i.type)};
    const i=inputs[0];
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(i, n);
    i.dispatchEvent(new Event('input',{bubbles:true}));
    i.dispatchEvent(new Event('change',{bubbles:true}));
    return {ok:true, placeholder:i.placeholder||null, value:i.value};
  }, [name, VIS]);
  if (out.typed.err) return out;
  await page.waitForTimeout(900);
  out.saved = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const b=[...p.querySelectorAll('button')].filter(vis).find(x=>/^Save$/i.test((x.innerText||'').trim()));
    if(!b) return {err:'no Save'}; if(b.disabled) return {err:'Save disabled'};
    b.click(); return {ok:true}; }, VIS);
  await page.waitForTimeout(6000);
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    const notes=[...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"],[class*="Toast"]')].filter(vis)
      .map(n=>(n.innerText||'').replace(/\s+/g,' ').slice(0,140)).filter(Boolean);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]');
    return {notes, header:(ov?ov.innerText:'').replace(/\s+/g,' ').slice(0,120)}; }, VIS);
  return out;
}
