export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001', parent='M4OWSWLE61Y8WAA';
  const out={};
  out.unreadRaw = await page.evaluate(async(ws)=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'});
    const t=await r.text();
    return t.slice(0,400);
  }, ws);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  out.parent = await page.evaluate((parent)=>{
    const el=document.querySelector(`[data-message-id="${parent}"]`);
    if(!el) return 'not rendered';
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    return {txt:(el.innerText||'').replace(/\s+/g,' ').slice(0,90),
      btns:[...el.querySelectorAll('button,a')].filter(vis)
        .map(b=>({l:b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,24)})),
      classes:String(el.className||'').slice(0,60)};
  }, parent);
  // is there anything anywhere marking unread threads?
  out.threadMarkers = await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('body *')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim())
      .filter(t=>/repl|thread|new/i.test(t)&&t.length<40);
  });
  return out;
};
