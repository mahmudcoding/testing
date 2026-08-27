export default async ({page}) => {
  const WS='W4QBF1XTURESO01'; const M=process.env.QA_MID;
  const out={};
  await page.goto(`https://staging.airion-cargo.store/w/${WS}/call/${M}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.before = await page.evaluate(()=>({url:location.href, text:document.body.innerText.replace(/\s+/g,' ').slice(0,300),
    btns:[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,25)}));
  const box = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^(Join|Join call|Ask to join|Join now)$/i.test((x.innerText||'').trim()));
    if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
    return {x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2), t:(b.innerText||'').trim()};
  });
  out.joinBtn = box;
  if (box) await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(8000);
  out.after = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null);
    return {url:location.href, cur:j&&j.meeting?{id:j.meeting.id,name:j.meeting.name}:null,
      text:document.body.innerText.replace(/\s+/g,' ').slice(0,260)};
  });
  return out;
};
