export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(8000);
  const found=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const c=[...document.querySelectorAll('a,button,[role="button"]')].filter(vis)
      .filter(e=>/New direct message/i.test((e.getAttribute('aria-label')||'')+' '+(e.textContent||'')));
    if(!c.length) return null;
    c[0].setAttribute('data-qa-newdm','1');
    return {tag:c[0].tagName, href:c[0].getAttribute('href'),
      label:(c[0].getAttribute('aria-label')||c[0].textContent||'').trim().slice(0,30)};});
  out.control=found;
  if(!found) return out;
  const before=page.url().replace('https://airion-cargo.store','');
  await page.locator('[data-qa-newdm="1"]').click();
  await page.waitForTimeout(3000);
  out.after=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    return {url:location.pathname+location.search.slice(0,26),
      dialog:d?(d.innerText||'').replace(/\s+/g,' ').slice(0,180):null,
      inputs:d?[...d.querySelectorAll('input')].filter(vis).map(i=>i.getAttribute('placeholder')):[],
      btns:d?[...d.querySelectorAll('button')].filter(vis)
        .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,20)).slice(0,10):[]};});
  out.before=before;
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  return out;
};
