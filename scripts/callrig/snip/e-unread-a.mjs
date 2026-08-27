export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  // alice: sit in a DIFFERENT channel so #qa-general accrues unread
  await page.goto(`https://airion-cargo.store/w/${WS}/directories`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const before = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/workspaces/W4QEF1XTURESO01/unread',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const side=[...document.querySelectorAll('a,button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;})
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').replace(/\n/g,' ').trim())
      .filter(t=>/qa-general|qa-private/.test(t)).slice(0,4);
    return {api:JSON.stringify(j).slice(0,220), sidebar:side};
  });
  return {before};
};
