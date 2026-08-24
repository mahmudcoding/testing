export default async ({page}) => {
  const sink = async () => await page.evaluate(()=>[...document.querySelectorAll('audio')].map(a=>({tid:a.getAttribute('data-testid')||'-', sinkId:(a.sinkId||'').slice(0,14), vol:a.volume})));
  const r={before: await sink()};
  const sel = await page.$('button[aria-label="Select microphone"]');
  if (!sel) return {err:'no selector', ...r};
  await sel.click(); await page.waitForTimeout(2200);
  const m=[...(await page.$$('[role="menu"],[data-radix-popper-content-wrapper]'))].pop();
  if (m) { for (const it of await m.$$('button,[role="menuitem"],[role="menuitemradio"]')) {
    const t=(await it.innerText()).trim(); if (/Fake Audio Output 2/i.test(t)) { await it.click(); r.picked=t.replace(/\n/g,' '); break; } } }
  await page.waitForTimeout(4000);
  r.after = await sink();
  return r;
};
