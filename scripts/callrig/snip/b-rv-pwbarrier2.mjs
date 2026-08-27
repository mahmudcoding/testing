export default async ({page}) => {
  const out={};
  const box = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Join$/i.test((x.innerText||'').trim()));
    if(!b) return null; const r=b.getBoundingClientRect(); return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};
  });
  if (box) await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(8000);
  out.screen = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const t=document.body.innerText.replace(/\s+/g,' ');
    const join=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Join call$/i.test((x.innerText||'').trim()));
    return {url:location.href, barrier:/password-protected/i.test(t), tail:t.slice(-280),
      pwInputs:[...document.querySelectorAll('input[type=password]')].filter(vis).map(i=>({ph:i.placeholder,v:i.value,lab:(i.labels&&i.labels[0]&&i.labels[0].innerText)||i.getAttribute('aria-label')})),
      joinBtn: join?{disabled:join.disabled===true||join.getAttribute('aria-disabled')==='true'}:null,
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(-6)};
  });
  return out;
};
