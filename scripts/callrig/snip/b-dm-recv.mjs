export default async ({page}) => {
  const ws='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QBGENERAL0001`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const unread = await page.evaluate(async(ws)=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'});
    return (await r.text()).slice(0,500);
  }, ws);
  const sidebar = await page.evaluate(()=>[...document.querySelectorAll('a,button')]
    .filter(e=>{const r=e.getBoundingClientRect(); return r.width>0&&r.x<380&&/alice|direct/i.test(e.innerText||e.getAttribute('aria-label')||'');})
    .map(e=>({t:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,40), h:(e.getAttribute('href')||'').slice(0,44)})).slice(0,6));
  const dm = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/messaging/channels/C4OUWJID5OCFYYO/messages?limit=10',{credentials:'include'});
    const t=await r.text(); return {s:r.status, body:t.slice(0,300)};
  });
  return {unread, sidebar, dm};
};
