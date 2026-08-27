export default async ({page}) => {
  const WS='W4QBF1XTURESO01'; const M=process.env.QA_MID;
  const out={};
  await page.goto(`https://staging.airion-cargo.store/w/${WS}/call/${M}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const box = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^(Join|Join call|Ask to join|Join now)$/i.test((x.innerText||'').trim()));
    if(!b) return null; const r=b.getBoundingClientRect(); return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};
  });
  if (box) await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(9000);
  out.waitingBefore = await page.evaluate(()=>{ const t=document.body.innerText.replace(/\s+/g,' ');
    const m=t.match(/.{0,30}Waiting for host approval.{0,60}/i); return {ok:!!m, ex:(m&&m[0])||t.slice(-140)}; });
  out.queueBefore = await page.evaluate(async(id)=>{ const r=await fetch(`/api/v1/meeting/${id}/waiting`,{credentials:'include'}); let b=null; try{b=await r.json();}catch{} return {s:r.status, body:JSON.stringify(b).slice(0,300)}; }, M);
  if (process.env.QA_RELOAD) {
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForTimeout(9000);
    out.afterReload = await page.evaluate(()=>{
      const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      const t=document.body.innerText.replace(/\s+/g,' ');
      return {url:location.href, waiting:/Waiting for host approval/i.test(t),
        ready:/READY TO JOIN/i.test(t),
        tail:t.slice(-220),
        btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(-8)};
    });
  }
  return out;
};
