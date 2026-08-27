export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const all=[...document.querySelectorAll('button,a')].filter(vis);
    return {url:location.pathname,
      matching: all.filter(b=>/notif|bell/i.test((b.getAttribute('aria-label')||'')+' '+b.innerText+' '+(b.getAttribute('href')||'')))
        .map(b=>({tag:b.tagName, al:b.getAttribute('aria-label'), href:b.getAttribute('href'), txt:b.innerText.replace(/\n/g,' ').trim().slice(0,30)})),
      railSample: all.slice(0,18).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\n/g,' ').trim().slice(0,28))};
  });
};
