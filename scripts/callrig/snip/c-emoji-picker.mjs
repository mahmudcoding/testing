export default async ({page}) => {
  const WS = 'W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  const chans = await page.evaluate(async (ws) => {
    const r = await fetch(`/api/v1/workspaces/${ws}/channels`, {credentials:'include'});
    const j = await r.json();
    const list = Array.isArray(j) ? j : (j.channels||j.items||[]);
    return list.map(c=>({id:c.id, name:c.name}));
  }, WS);
  const gen = chans.find(c=>/general/.test(c.name));
  await page.evaluate(async (cid) => {
    await fetch('/api/v1/messaging/messages', {method:'POST', credentials:'include', headers:{'content-type':'application/json'}, body: JSON.stringify({channel_id: cid, body:'QA-EMOJI-1'})});
  }, gen.id);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${gen.id}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  // hover last message
  const msgs = await page.$$('[data-message-id]');
  const last = msgs[msgs.length-1];
  await last.hover();
  await page.waitForTimeout(900);
  const actionBtns = await page.evaluate(() => [...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)).filter(l=>/react|emoji/i.test(l)));
  const opened = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(b=>b.offsetParent && /add reaction|react/i.test(b.getAttribute('aria-label')||''));
    if (!b) return false; b.click(); return true;
  });
  await page.waitForTimeout(2500);
  const picker = await page.evaluate(() => {
    // find the popover containing a search input placeholder Search emoji
    const inp = [...document.querySelectorAll('input')].find(i=>/emoji/i.test(i.placeholder||i.getAttribute('aria-label')||''));
    const root = inp ? inp.closest('div[class*="flex"]')?.parentElement || inp.parentElement : null;
    const scope = root || document.body;
    const btns = [...scope.querySelectorAll('button')].filter(b=>b.getClientRects().length);
    const cp = s => [...s].map(c=>'U+'+c.codePointAt(0).toString(16).toUpperCase()).join(' ');
    return {
      foundSearch: !!inp,
      sectionLabels: [...scope.querySelectorAll('section[aria-label], [role="tablist"], [role="tab"]')].map(e=>({tag:e.tagName, role:e.getAttribute('role'), al:e.getAttribute('aria-label')})),
      headers: [...scope.querySelectorAll('div')].map(d=>d.childElementCount===0?d.textContent.trim():'').filter(t=>t && t.length<20 && /^[A-Z& ]+$/.test(t)).slice(0,10),
      first14: btns.slice(0,14).map((b,i)=>({i, al:b.getAttribute('aria-label'), txt:b.textContent.trim(), cp:cp(b.textContent.trim()), w:Math.round(b.getBoundingClientRect().width), h:Math.round(b.getBoundingClientRect().height)})),
      total: btns.length
    };
  });
  return {chan: gen, actionBtns, opened, picker};
};
