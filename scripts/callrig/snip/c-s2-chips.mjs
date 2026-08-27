export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const probe=async(sel, name)=>{
    const b=page.locator(sel).first();
    if(!await b.count()) return {name, found:false};
    const before=page.url().replace('https://airion-cargo.store','');
    await b.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
    await b.click({force:true});
    const s=[]; for(let i=0;i<8;i++){ await page.waitForTimeout(500);
      s.push(await page.evaluate(()=>{
        const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
        const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
        return {url:location.pathname+location.search.slice(0,24),
          dialog:d?(d.innerText||'').replace(/\s+/g,' ').slice(0,90):null,
          poppers:document.querySelectorAll('[data-radix-popper-content-wrapper]').length};})); }
    const changed=s.some(x=>x.url!==before);
    const dlg=s.find(x=>x.dialog);
    await page.keyboard.press('Escape'); await page.waitForTimeout(600);
    if(changed){ await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`); await page.waitForTimeout(6000); }
    return {name, found:true, before, urlChanged:changed, finalUrl:s.at(-1).url,
      dialog:dlg?dlg.dialog:null, poppers:Math.max(...s.map(x=>x.poppers))};
  };
  out.mentionChip=await probe('main button[data-mention-user-id]', 'mention chip');
  out.channelChip=await probe('main button:has-text("#qa-private")', 'channel chip');
  out.mentionBtn=await probe('button[aria-label="Mention someone"]', 'Mention someone button');
  return out;
};
