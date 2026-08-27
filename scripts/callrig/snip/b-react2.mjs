export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID;
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(1800);
  const toolbar = await page.evaluate((mid)=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    return [...a.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0;})
      .map(b=>({label:(b.getAttribute('aria-label')||'').trim(), text:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,16)}));
  }, mid);
  const opened = await page.evaluate((mid)=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    const b=[...a.querySelectorAll('button')].find(x=>/reaction|emoji/i.test(x.getAttribute('aria-label')||''));
    if(!b) return null; b.click(); return (b.getAttribute('aria-label')||'');
  }, mid);
  await page.waitForTimeout(1500);
  const picker = await page.evaluate(()=>{
    const dlg=[...document.querySelectorAll('[role=dialog],[data-radix-popper-content-wrapper]')].filter(d=>d.getBoundingClientRect().width>0);
    const emojiBtns=[...document.querySelectorAll('button')].filter(b=>{
      const r=b.getBoundingClientRect(); const t=(b.innerText||'').trim();
      return r.width>0&&r.height>0&&t.length>0&&t.length<=4&&/\p{Extended_Pictographic}/u.test(t);
    });
    return {dialogs:dlg.length, emojiCount:emojiBtns.length, firstEmojis:emojiBtns.slice(0,8).map(b=>(b.innerText||'').trim())};
  });
  return {mid, toolbar, opened, picker};
};
