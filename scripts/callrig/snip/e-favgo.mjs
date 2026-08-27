export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const net=[];
  page.on('response', async r=>{const m=r.request().method(); if(m!=='GET') net.push({m,u:r.url().replace('https://airion-cargo.store','').slice(0,60),s:r.status()});});
  await page.goto(`https://airion-cargo.store/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  // ensure we're on All files
  await page.locator('main button:has-text("All files")').first().click().catch(()=>{});
  await page.waitForTimeout(1800);
  // click the Favorite control on the image row (2nd occurrence)
  const favs = page.locator('main button[aria-label="Favorite"]');
  const n = await favs.count();
  if(!n) return {err:'no Favorite control', n};
  await favs.nth(n-1).click();
  await page.waitForTimeout(3000);
  const apiAfter = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/users/me/files?workspace_id=W4QEF1XTURESO01&scope=own',{credentials:'include'});
    const j=await r.json(); return (j.files||[]).map(f=>({n:f.filename, fav:f.is_favorite}));
  });
  // Favorites filter
  await page.locator('main button:has-text("Favorites")').first().click().catch(()=>{});
  await page.waitForTimeout(2500);
  const favView = await page.evaluate(()=>{
    const m=document.querySelector('main'); const t=m.innerText;
    return (t.split('Size')[1]||t.slice(-250)).replace(/\n{2,}/g,' | ').slice(0,250);
  });
  // reload to confirm persistence
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const apiReload = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/users/me/files?workspace_id=W4QEF1XTURESO01&scope=own',{credentials:'include'});
    const j=await r.json(); return (j.files||[]).map(f=>({n:f.filename, fav:f.is_favorite}));
  });
  return {controls:n, net, apiAfter, favView, apiReload};
};
