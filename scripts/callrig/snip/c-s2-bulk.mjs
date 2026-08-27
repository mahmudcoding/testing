const WS='W4QCF1XTURESO01', CH='C4OWKU9EANT1XSR';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  return await page.evaluate(async (ch)=>{
    let ok=0, fail=0, firstErr=null;
    for (let i=1;i<=130;i++) {
      try {
        const r = await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({channel_id: ch, body: `QA-S2-PAGE-${String(i).padStart(3,'0')}`})});
        if (r.ok) ok++; else { fail++; if(!firstErr) firstErr=(await r.text()).slice(0,120); }
      } catch(e){ fail++; if(!firstErr) firstErr=String(e).slice(0,80); }
    }
    const g = await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=100`,{credentials:'include'});
    const j = await g.json(); const list=(j.messages||j.data||[]);
    return {ok, fail, firstErr, pageSize:list.length, keys:Object.keys(j).join(','),
      newest:list[0]&&list[0].body, oldest:list[list.length-1]&&list[list.length-1].body,
      cursor: j.next_cursor||j.cursor||null};
  }, CH);
};
