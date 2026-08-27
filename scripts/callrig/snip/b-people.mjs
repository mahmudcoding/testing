export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const rows = await page.evaluate(()=>{
    const els=[...document.querySelectorAll('button,a,tr,li,[role=row]')].filter(e=>{
      const r=e.getBoundingClientRect(); return r.width>60&&r.height>20&&/alice/i.test(e.innerText||'');});
    return els.map(e=>({tag:e.tagName, role:e.getAttribute('role')||'',
      text:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,50),
      x:Math.round(e.getBoundingClientRect().x), y:Math.round(e.getBoundingClientRect().y),
      w:Math.round(e.getBoundingClientRect().width)})).slice(0,6);
  });
  const main = await page.evaluate(()=>(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,220));
  return {rows, main};
};
