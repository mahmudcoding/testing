const WS='W4QCF1XTURESO01', CH='C4OWOSZN35PTPMA', PID='M4OWQ375XE923T4';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  return await page.evaluate(async (pid)=>{
    let ok=0, fail=0, firstErr=null;
    for (let i=1;i<=130;i++){
      try { const r=await fetch(`/api/v1/messaging/messages/${pid}/reply`,{method:'POST',credentials:'include',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({body:`QA-S2-TR-${String(i).padStart(3,'0')}`})});
        if (r.ok) ok++; else { fail++; if(!firstErr) firstErr=(await r.text()).slice(0,120); }
      } catch(e){ fail++; }
    }
    const t=await fetch(`/api/v1/messaging/messages/${pid}/thread?limit=100`,{credentials:'include'});
    const j=await t.json();
    const reps=j.replies||[];
    return {ok, fail, firstErr, status:t.status, page1:reps.length, has_more:j.has_more,
      newest:(reps[0]&&reps[0].body||'').slice(0,20), oldest:(reps[reps.length-1]&&reps[reps.length-1].body||'').slice(0,20),
      keys:Object.keys(j).join(',')};
  }, PID);
};
