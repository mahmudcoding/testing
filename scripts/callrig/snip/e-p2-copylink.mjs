import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  // instrument the clipboard BEFORE the action
  await page.evaluate(`(() => {
     window.__clip=[];
     if(navigator.clipboard){ const o=navigator.clipboard.writeText?.bind(navigator.clipboard);
       navigator.clipboard.writeText = async (t)=>{ window.__clip.push(String(t)); try{ return o? await o(t):undefined; }catch(e){ return undefined; } }; }
     const oe=document.execCommand?.bind(document);
     if(oe) document.execCommand=(c,...r)=>{ if(c==='copy'){ const s=window.getSelection?.().toString(); if(s) window.__clip.push(s); } return oe(c,...r); };
  })()`);
  const tile = await page.evaluate(`(() => { ${VISFN}
    const t=[...document.querySelector('main').querySelectorAll('button,[role=button],a')].filter(vis)
      .find(b=>/\\.(png|txt)/i.test(b.getAttribute('aria-label')||b.textContent||''));
    const r=t.getBoundingClientRect();
    return {label:(t.getAttribute('aria-label')||t.textContent||'').trim().slice(0,30),
            cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.tile=tile;
  await page.mouse.click(tile.cx, tile.cy, {button:'right'}); await page.waitForTimeout(2000);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     clickDeepest(document.querySelector('[role=menu]')||document.body, /View details/i); })()`);
  await page.waitForTimeout(4500);
  out.copyClick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const c=[...document.querySelectorAll('[role=dialog],aside,[data-state=open]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;});
     return clickDeepest(c.pop()||document.body, /^Copy link$/); })()`);
  const s=[]; for(let i=0;i<10;i++){ await page.waitForTimeout(350);
    s.push(await page.evaluate(`(() => ({clip:(window.__clip||[]).slice(0,2),
      note:[...document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast]')]
        .filter(n=>n.getBoundingClientRect().width>1).map(n=>(n.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean).slice(0,2)}))()`)); }
  out.clip = s[s.length-1].clip;
  out.notices = [...new Set(s.flatMap(x=>x.note))].slice(0,3);
  return out;
};
