export default async ({page}) => {
  const out={};
  const submit = async (pw) => {
    const inp = await page.$('input[type=password]');
    if (!inp) return {noInput:true};
    await inp.fill(pw);
    await page.waitForTimeout(400);
    await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^Join call$/i.test((x.innerText||'').trim())); if(b) b.click(); });
    await page.waitForTimeout(5000);
    return await page.evaluate(async()=>{
      const vis = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
      const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null);
      const bodyTxt = document.body.innerText.replace(/\s+/g,' ');
      return {
        inCall: j&&j.meeting? j.meeting.id : null,
        stillGate: !!document.querySelector('input[type=password]'),
        err: (bodyTxt.match(/.{0,30}(incorrect|wrong|invalid|try again|does not match|error).{0,80}/i)||[])[0]||null,
        visibleAlerts: [...document.querySelectorAll('[role=alert],[aria-live],[class*="error"],[class*="toast"]')].filter(vis).map(x=>x.innerText.replace(/\s+/g,' ').trim().slice(0,120)).filter(Boolean).slice(0,5)
      };
    });
  };
  out.wrong = await submit('WrongPass1');
  out.right = await submit('Secret123');
  return out;
};
