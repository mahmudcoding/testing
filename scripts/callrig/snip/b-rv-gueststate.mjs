export default async ({ctx}) => {
  const pages = ctx.pages().filter(p=>p.url().includes('airion-cargo.store'));
  const out={pages:pages.map(p=>p.url())};
  const g = pages.find(p=>/\/guest\/meeting\//.test(p.url()));
  if(!g) return out;
  out.screen = await g.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    return {url:location.href, txt:document.body.innerText.replace(/\s+/g,' ').slice(0,400),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,32),al:b.getAttribute('aria-label'),tid:b.getAttribute('data-testid')})).slice(0,30)};
  });
  if (process.env.QA_ACCEPT) {
    out.clicked = await g.evaluate(()=>{
      const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^(Join|Join room|Accept|Join Side Room)$/i.test((x.innerText||'').trim()));
      if(b){ const r=b.getBoundingClientRect(); return {t:(b.innerText||'').trim(), x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)}; } return null;
    });
    if (out.clicked) { await g.mouse.click(out.clicked.x, out.clicked.y); await g.waitForTimeout(7000);
      out.after = await g.evaluate(()=>({url:location.href, txt:document.body.innerText.replace(/\s+/g,' ').slice(0,300)})); }
  }
  return out;
};
