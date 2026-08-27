export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  return await page.evaluate(async () => {
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const hist = await (await fetch('/api/v1/meetings/history?limit=100',{credentials:'include'})).json();
    const items = hist.meetings || hist.items || hist.data || [];
    const tabs = [...document.querySelectorAll('button,[role=tab]')]
      .filter(b=>b.offsetParent)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,40))
      .filter(t=>t);
    return {
      lang: me.language || me.locale || me.settings?.language || '(n/a)',
      histKeys: Object.keys(hist).slice(0,8),
      histCount: items.length,
      nextCursor: hist.next_cursor ? String(hist.next_cursor).slice(0,30) : null,
      sampleItem: items[0] ? Object.keys(items[0]).join(',').slice(0,300) : null,
      types: items.slice(0,100).reduce((a,m)=>{const k=m.type||m.meeting_type||'?';a[k]=(a[k]||0)+1;return a;},{}),
      visibleButtons: tabs.slice(0,40),
      rows: document.querySelectorAll('[data-testid*="call"],[data-testid*="meeting"]').length
    };
  });
};
