export default async ({page}) => {
  const ws='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/mentions`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const men = await page.evaluate(()=>{
    // leaf-ish elements whose text contains a backslash-escape or the mention
    const all=[...document.querySelectorAll('*')].filter(e=>{
      const r=e.getBoundingClientRect(); if(r.width<20||r.height<8) return false;
      const t=(e.innerText||''); return /mention-check|mention\\-check/.test(t) && e.children.length<=2;
    });
    const e=all[all.length-1];
    return e?{tag:e.tagName, text:(e.innerText||'').replace(/\s+/g,' ').slice(0,120),
      html:(e.innerHTML||'').slice(0,200), hasBackslash:/\\/.test(e.innerText||'')}:{none:true};
  });
  // now the same message rendered in the channel
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QBGENERAL0001`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const ch = await page.evaluate(()=>{
    const a=[...document.querySelectorAll('[data-message-id]')].filter(x=>/mention/i.test(x.innerText||'')).slice(-1)[0];
    return a?{text:(a.innerText||'').replace(/\s+/g,' ').slice(0,120), hasBackslash:/\\/.test(a.innerText||''),
      html:(a.innerHTML||'').replace(/\s+/g,' ').slice(-220)}:{none:true};
  });
  return {mentionsPage:men, channel:ch};
};
