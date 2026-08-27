export default async ({page}) => {
  const id='C4QBGENERAL0001', emo='🎉';
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  // fresh message with no reactions
  await page.click(sel); await page.keyboard.type('QA-B-R1 reaction control',{delay:15});
  await page.waitForTimeout(300); await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  const mid = await page.evaluate(()=>[...document.querySelectorAll('[data-message-id]')].slice(-1)[0]?.getAttribute('data-message-id'));
  const api = () => page.evaluate(async(mid)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=10',{credentials:'include'})).json();
    const m=(j?.data?.messages||j?.messages||[]).find(x=>x.id===mid);
    return (m?.reactions||[]).map(r=>({e:r.emoji,c:r.count}));
  }, mid);
  const openPicker = async () => {
    const art = await page.$(`[data-message-id="${mid}"]`);
    await art.hover().catch(()=>{});
    await page.waitForTimeout(1600);
    await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
      [...a.querySelectorAll('button')].find(x=>/reaction/i.test(x.getAttribute('aria-label')||''))?.click();}, mid);
    await page.waitForTimeout(2000);
    return await page.evaluate((emo)=>{
      const all=[...document.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();
        const t=(b.innerText||'').trim();
        return r.width>0&&r.height>0&&t.length>0&&t.length<=4&&/\p{Extended_Pictographic}/u.test(t);});
      const same=all.filter(b=>(b.innerText||'').trim()===emo)[0];
      return {emojiButtons:all.length, hasTarget:!!same,
        pos: same?{x:Math.round(same.getBoundingClientRect().x+same.getBoundingClientRect().width/2),
                   y:Math.round(same.getBoundingClientRect().y+same.getBoundingClientRect().height/2)}:null};
    }, emo);
  };
  // CONTROL: picker on a message with no reactions
  const control = await openPicker();
  let added=null;
  if(control.pos){ await page.mouse.click(control.pos.x, control.pos.y); await page.waitForTimeout(3000); added=await api(); }
  else { await page.keyboard.press('Escape').catch(()=>{}); }
  // TEST: same message, now carrying my reaction
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(800);
  const test1 = await openPicker();
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(800);
  const test2 = await openPicker();
  const after = await api();
  return {mid, control, added, test1, test2, after};
};
