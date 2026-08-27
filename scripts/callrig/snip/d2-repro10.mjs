export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    const txt=(main.innerText||'').replace(/\s+/g,' ');
    const i=txt.indexOf('Settings ›');
    const c=(i>=0?txt.slice(i):txt);
    // raw event keys look like word.word or word_word in the rows
    const keys=[...new Set((c.match(/\b[a-z]+[._][a-z_.]+\b/g)||[]))].slice(0,10);
    const json=/[{}]|"[a-z_]+":/.test(c);
    return { sample:c.slice(0,300), rawKeys:keys, looksLikeJson:json };
  });
};
