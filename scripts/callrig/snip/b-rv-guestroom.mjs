export default async ({ctx}) => {
  const pages = ctx.pages().filter(p=>p.url().includes('airion-cargo.store'));
  const g = pages.find(p=>/\/guest\/meeting\//.test(p.url()));
  if(!g) return {err:'no guest page'};
  const out={};
  await g.evaluate(()=>{ const b=document.querySelector('[data-testid="call-controls-breakout-rooms"]'); if(b) b.click(); });
  await g.waitForTimeout(3000);
  out.panelBtns = await g.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const t=document.body.innerText.replace(/\s+/g,' ');
    return {sideRooms:(t.match(/Side Rooms.{0,200}/)||[])[0]||null,
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,26),tid:b.getAttribute('data-testid')})).filter(b=>/join|room/i.test(b.t+(b.tid||'')))};
  });
  const box = await g.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Join( room)?$/i.test((x.innerText||'').trim()));
    if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
    return {x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2), t:(b.innerText||'').trim()};
  });
  out.joinBox = box;
  if (box) { await g.mouse.click(box.x, box.y); await g.waitForTimeout(3000);
    out.confirm = await g.evaluate(()=>{ const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>vis(x)&&x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
      return d? {t:d.innerText.replace(/\s+/g,' ').slice(0,200), b:[...d.querySelectorAll('button')].filter(vis).map(y=>(y.innerText||'').trim())}:null; });
    await g.waitForTimeout(7000);
    out.after = await g.evaluate(()=>({url:location.href, txt:document.body.innerText.replace(/\s+/g,' ').slice(0,300)}));
  }
  return out;
};
