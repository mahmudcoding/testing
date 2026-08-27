export default async ({page, ctx}) => {
  const out={};
  const link=process.env.QA_URL;
  const p2 = await ctx.newPage();
  await p2.goto(link,{waitUntil:'domcontentloaded'});
  await p2.waitForTimeout(6000);
  out.screen = await p2.evaluate(()=>({url:location.href, txt:document.body.innerText.replace(/\s+/g,' ').slice(0,220),
    inputs:[...document.querySelectorAll('input')].filter(i=>i.getBoundingClientRect().width>0).map(i=>i.type),
    btns:[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>({t:(b.innerText||'').trim(),d:b.disabled}))}));
  const nm = await p2.$('input[type=text]');
  if (nm) await nm.fill(process.env.QA_GNAME || 'Guest Side');
  await p2.waitForTimeout(1000);
  const box = await p2.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^(Join call|Ask to join|Continue)$/i.test((x.innerText||'').trim())); if(!b||b.disabled) return null; const r=b.getBoundingClientRect(); return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2),t:(b.innerText||'').trim()}; });
  out.joinBtn = box;
  if (box) await p2.mouse.click(box.x, box.y);
  await p2.waitForTimeout(10000);
  out.after = await p2.evaluate(()=>({url:location.href, txt:document.body.innerText.replace(/\s+/g,' ').slice(0,250)}));
  // report the CDP target id of the guest tab so it can be killed abruptly later
  const s = await ctx.newCDPSession(p2);
  const ti = await s.send('Target.getTargetInfo');
  out.targetId = ti.targetInfo.targetId;
  return out;
};
