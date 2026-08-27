export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(()=>{
    const banner = [...document.querySelectorAll('*')].some(e=>/Incoming call/i.test(e.innerText||'') );
    const m=document.querySelector('main');
    const txt=(m?m.innerText:'');
    const rows=txt.split('\n').map(s=>s.trim()).filter(Boolean);
    const i=rows.findIndex(r=>/^Recent/i.test(r));
    return {bannerStillUp:banner,
            tabs:rows.filter(r=>/·\s*\d+$/.test(r)).slice(0,4),
            recentHead: rows.slice(i, i+22)};
  });
};
