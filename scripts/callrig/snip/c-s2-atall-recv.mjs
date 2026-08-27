const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  return await page.evaluate(async (ws)=>{
    const u=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'});
    const j=await u.json();
    const gen=(j.unread_counts||[]).find(c=>c.channel_id==='C4QCGENERAL0001');
    const find=(re)=>{const e=[...document.querySelectorAll('[data-message-id]')].filter(m=>re.test(m.innerText||'')).pop();
      if(!e) return null;
      const chips=[...e.querySelectorAll('span,a,button')].filter(x=>/@/.test(x.textContent||'')).map(x=>({t:(x.textContent||'').trim().slice(0,20), cls:(x.className||'').slice(0,60)}));
      return {text:e.innerText.replace(/\n+/g,' | ').slice(0,80), chips:chips.slice(0,3)};};
    return {unreadGen:gen, unreadKeys:Object.keys((j.unread_counts||[])[0]||{}).join(','),
      atall: find(/QA-S2-ATALL/), athere: find(/QA-S2-MENT-HERE/), direct: find(/QA-S2-MENT-DIRECT2/)};
  }, WS);
};
