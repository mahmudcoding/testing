export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(10000);
  await page.locator('button[aria-label*="otification"], button[aria-label*="Bell"]').first()
    .click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(3500);
  const h=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('button[aria-label]')].filter(v)
      .find(e=>/QA-ARCHNOTIF/.test(e.getAttribute('aria-label')||''))||null;});
  const el=h.asElement();
  const out={entryFound:!!el};
  if(el){ await el.click({timeout:6000}).catch(()=>{out.clickFail=true}); }
  await page.waitForTimeout(7000);
  out.after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const main=document.querySelector('main');
    const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
    return {url:location.pathname+location.search.slice(0,30),
      mainText:main?(main.innerText||'').replace(/\s+/g,' ').trim().slice(0,150):'NO-MAIN',
      composerPresent:!!c,
      composerEditable:c?c.getAttribute('contenteditable'):null,
      messages:document.querySelectorAll('main [data-message-id]').length,
      banners:[...document.querySelectorAll('main *')].filter(v)
        .filter(e=>e.children.length===0)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim())
        .filter(t=>/archiv|read.only|only view/i.test(t)).slice(0,3)};});
  return out;
};
