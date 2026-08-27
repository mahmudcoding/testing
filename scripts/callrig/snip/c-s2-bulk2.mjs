const WS='W4QCF1XTURESO01', CH='C4OWKU9EANT1XSR';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  return await page.evaluate(async (ch)=>{
    let ok=0, fail=0;
    for (let i=131;i<=280;i++) {
      try { const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({channel_id: ch, body: `QA-S2-PAGE-${String(i).padStart(3,'0')}`})});
        if (r.ok) ok++; else fail++;
      } catch(e){ fail++; }
    }
    const g=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=100`,{credentials:'include'});
    const j=await g.json();
    return {ok, fail, pageSize:(j.messages||[]).length, has_more:j.has_more};
  }, CH);
};
