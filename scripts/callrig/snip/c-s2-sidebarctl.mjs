export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(8000);
  const probe=async(sel,name)=>{
    const b=page.locator(sel).first();
    if(!await b.count()) return {name, found:false};
    const before=page.url().replace('https://airion-cargo.store','');
    const sideBefore=await page.evaluate(()=>document.querySelectorAll('nav a, aside a').length);
    await b.click({force:true});
    const s=[]; for(let i=0;i<8;i++){ await page.waitForTimeout(500);
      s.push(await page.evaluate(()=>{
        const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
        const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
        return {url:location.pathname+location.search.slice(0,20),
          dialog:d?(d.innerText||'').replace(/\s+/g,' ').slice(0,110):null,
          sideLinks:document.querySelectorAll('nav a, aside a').length};})); }
    const out2={name, found:true, before, urlChanged:s.some(x=>x.url!==before),
      finalUrl:s.at(-1).url, dialog:(s.find(x=>x.dialog)||{}).dialog||null,
      sideBefore, sideAfter:s.at(-1).sideLinks};
    await page.keyboard.press('Escape'); await page.waitForTimeout(700);
    return out2;
  };
  out.newDm=await probe('a[href*="new"], a:has-text("New direct message")', 'New direct message');
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`); await page.waitForTimeout(5000);
  out.archived=await probe('button[aria-label="Open archived channels"]', 'Open archived channels');
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`); await page.waitForTimeout(5000);
  out.collapse=await probe('button[aria-label="Collapse chat sidebar"]', 'Collapse chat sidebar');
  return out;
};
