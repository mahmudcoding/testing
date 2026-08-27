export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8500);
  return page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-S2-T3146/.test(x.innerText||''));
    if(!e) return 'absent';
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>2&&r.height>2;};
    const leaves=[...e.querySelectorAll('*')].filter(x=>x.children.length===0)
      .map(x=>({t:(x.textContent||'').trim().slice(0,30), vis:vis(x),
        w:Math.round(x.getBoundingClientRect().width)}))
      .filter(x=>x.t);
    return {full:(e.innerText||'').replace(/\s+/g,' ').slice(-70),
      hasEdited:/edited/i.test(e.innerText||''),
      leaves:leaves.slice(-8),
      titles:[...e.querySelectorAll('[title]')].map(x=>x.getAttribute('title')).slice(0,4)};
  });
};
