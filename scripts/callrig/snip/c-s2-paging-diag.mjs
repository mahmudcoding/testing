const WS='W4QCF1XTURESO01', CH='C4OWKU9EANT1XSR';
export default async ({page}) => {
  const out={};
  out.state = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=5`,{credentials:'include'});
    const j=await r.json();
    return {url:location.href, apiStatus:r.status, apiCount:(j.messages||[]).length,
      main:(document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,300),
      msgNodes:document.querySelectorAll('[data-message-id]').length,
      bodyLen:document.body.innerText.length};
  }, CH);
  out.console = [];
  page.on('console', m=>out.console.push(m.type()+':'+m.text().slice(0,100)));
  await page.reload({waitUntil:'load'});
  await page.waitForTimeout(8000);
  out.afterReload = await page.evaluate(()=>({url:location.href,
    msgNodes:document.querySelectorAll('[data-message-id]').length,
    main:(document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,300)}));
  return out;
};
