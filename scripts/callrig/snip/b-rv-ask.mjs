export default async ({page}) => {
  const WS='W4QBF1XTURESO01'; const M=process.env.QA_MID;
  const out={};
  await page.goto(`https://staging.airion-cargo.store/w/${WS}/call/${M}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const box = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^(Join|Join call|Ask to join|Join now|Request to join)$/i.test((x.innerText||'').trim()));
    if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
    return {t:(b.innerText||'').trim(), x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)};
  });
  out.btn = box;
  if (box) await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(9000);
  out.after = await page.evaluate(()=>({url:location.href, txt:document.body.innerText.replace(/\s+/g,' ').slice(0,260),
    btns:[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,15)}));
  return out;
};
