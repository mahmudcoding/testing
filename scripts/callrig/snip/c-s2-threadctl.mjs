export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const seed=await page.evaluate(async (ch)=>{
    const p=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,body:'QA-THRCTL parent'})});
    const pj=await p.json(); const pid=pj.id||pj.message?.id;
    await new Promise(r=>setTimeout(r,1500));
    await fetch(`/api/v1/messaging/messages/${pid}/reply`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,body:'QA-THRCTL reply one'})});
    return pid;}, ch);
  await page.waitForTimeout(2500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${seed}`);
  await page.waitForTimeout(13000);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    // thread panel = right side
    const ctrls=[...document.querySelectorAll('button,a,[role="button"]')].filter(v)
      .filter(e=>e.getBoundingClientRect().left>W*0.62)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,30));
    const pane=[...document.querySelectorAll('div,section,aside')].filter(v)
      .filter(e=>{const b=e.getBoundingClientRect();return b.left>W*0.6&&b.width>250&&b.height>300;})
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    return {parent:'QA-THRCTL', controls:[...new Set(ctrls)].sort(),
      paneHead: pane?(pane.innerText||'').replace(/\s+/g,' ').trim().slice(0,120):'NO-PANE'};});
};
