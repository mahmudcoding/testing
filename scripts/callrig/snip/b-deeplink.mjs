export default async ({page}) => {
  const mid='M4OUVF3LKQNP8SR';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001?m=${mid}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  return await page.evaluate((mid)=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    if(!a) return {found:false, total:document.querySelectorAll('[data-message-id]').length};
    const r=a.getBoundingClientRect();
    return {found:true, inViewport:r.y>=0&&r.y<=innerHeight, y:Math.round(r.y),
            highlighted:/bg-|highlight|ring/.test(a.className||''),
            text:(a.innerText||'').replace(/\s+/g,' ').slice(0,50)};
  }, mid);
};
