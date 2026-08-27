export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  return await page.evaluate(() => {
    const links=[];
    document.querySelectorAll('a[href*="settings"]').forEach(a=>{
      const r=a.getBoundingClientRect();
      if(r.width>0&&r.height>0) links.push({t:(a.innerText||'').trim().slice(0,40), h:a.getAttribute('href')});
    });
    const btns=[];
    document.querySelectorAll('button').forEach(b=>{
      const r=b.getBoundingClientRect();
      if(r.width>0&&r.height>0) btns.push(((b.innerText||'').trim()||b.getAttribute('aria-label')||'').slice(0,40));
    });
    return {url:location.pathname, links, btns:btns.slice(0,70)};
  });
};
