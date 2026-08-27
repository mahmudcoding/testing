export default async ({page}) => {
  const rows=await page.evaluate(()=>[...document.querySelectorAll('a[href*="/d/"]')]
    .filter(a=>a.getBoundingClientRect().height>0).map(a=>a.getAttribute('href')));
  const out=[];
  for(const href of rows){
    await page.locator(`a[href="${href}"]`).first().click({button:'right'});
    await page.waitForTimeout(900);
    const it=page.locator('[role="menu"]').getByText('Unpin',{exact:true}).first();
    if(await it.count()){ await it.click(); await page.waitForTimeout(1500); out.push('unpinned '+href.slice(-8)); }
    else { await page.keyboard.press('Escape'); await page.waitForTimeout(400); }
  }
  return {out, final: await page.evaluate(()=>[...document.querySelectorAll('a[href*="/d/"]')]
    .filter(a=>a.getBoundingClientRect().height>0).map(a=>(a.innerText||'').replace(/\s+/g,' ').slice(0,16)))};
};
