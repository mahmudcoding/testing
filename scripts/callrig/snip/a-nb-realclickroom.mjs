import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const room = process.env.QA_ROOM || 'Hidden Test';
  const out = {net:[]};
  page.on('response', async (r)=>{ const u=r.url(); if(!/\/api\/v1\//.test(u)) return; if(r.request().method()==='GET') return;
    let b=null; try{b=(await r.text()).slice(0,220);}catch(e){b='<no body>';}
    out.net.push({m:r.request().method(), s:r.status(), u:u.replace(/^https:\/\/[^/]+/,''), body:b}); });
  // locate the button and report its own state first
  const info = await page.evaluate(([n,v])=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const card=[...p.querySelectorAll('*')].filter(vis)
      .filter(e=>(e.innerText||'').includes(n) && e.querySelector('[data-testid="side-room-action"]'))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    if(!card) return {err:'no card'};
    const b=card.querySelector('[data-testid="side-room-action"]');
    const r=b.getBoundingClientRect();
    b.setAttribute('data-qa-target','1');
    return {label:(b.innerText||'').trim(), disabled:b.disabled,
      ariaDisabled:b.getAttribute('aria-disabled'),
      rect:{x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), w:Math.round(r.width), h:Math.round(r.height)}}; }, [room, VIS]);
  out.button = info;
  if (info.err) return out;
  await page.click('[data-qa-target="1"]');   // real Playwright click
  await page.waitForTimeout(8000);
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const notes=[...document.querySelectorAll('*')].filter(e=>!e.childElementCount)
      .filter(e=>{const t=(e.textContent||'').trim(); return t && t.length<80 && /request|access|denied|pending|ожид/i.test(t) && vis(e);})
      .map(e=>(e.textContent||'').trim().slice(0,60));
    return {stage:(ov.innerText||'').replace(/\s+/g,' ').slice(0,120), notes:[...new Set(notes)]}; }, VIS);
  return out;
}
