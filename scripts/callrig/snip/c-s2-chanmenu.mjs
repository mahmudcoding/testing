export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(7500);
  const chans=await page.evaluate(()=>[...document.querySelectorAll('a[href*="/c/"]')]
    .filter(x=>x.getBoundingClientRect().height>0)
    .map(a=>({href:a.getAttribute('href'), txt:(a.innerText||'').replace(/\s+/g,' ').slice(0,22)})));
  out.channels=chans;
  const probe=async(href,label)=>{
    await page.locator(`a[href="${href}"]`).first().click({button:'right'});
    await page.waitForTimeout(1200);
    const m=await page.evaluate(()=>{
      const x=document.querySelector('[role="menu"]');
      return x? (x.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean):'no menu';});
    await page.keyboard.press('Escape'); await page.waitForTimeout(600);
    return {label, menu:m};
  };
  // a channel alice owns and one she does not
  const owned=chans.find(c=>/qa-private/.test(c.txt));
  const notOwned=chans.find(c=>/qa-general/.test(c.txt));
  if(owned) out.owned=await probe(owned.href, owned.txt);
  if(notOwned) out.notOwned=await probe(notOwned.href, notOwned.txt);
  return out;
};
