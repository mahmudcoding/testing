export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const net=[];
  page.on('response', async r=>{const m=r.request().method(); if(m!=='GET'&&/favorit|file/i.test(r.url())) net.push({m,u:r.url().replace('https://airion-cargo.store','').slice(0,55),s:r.status()});});
  await page.goto(`https://airion-cargo.store/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const out={};
  // find a per-file action (hover or menu)
  const row = page.locator('main').getByText('qa-e-image.png').first();
  const box = await row.boundingBox();
  if(box){ await page.mouse.move(box.x+box.width/2, box.y+box.height/2); await page.waitForTimeout(1200); }
  out.rowControls = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    return [...m.querySelectorAll('button,[role=button]')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\n/g,' ').trim())
      .filter(t=>t && !/^(Grid view|List view|Upload|My files|Shared with me|All files|Images|Documents|Videos|Audio|Archives|All chats|Date|Name|Size)$/.test(t)).slice(0,12);
  });
  // click Favorites filter and see what it says
  await page.locator('main button:has-text("Favorites")').first().click().catch(()=>{});
  await page.waitForTimeout(2500);
  out.favView = await page.evaluate(()=>{
    const m=document.querySelector('main');
    const t=m.innerText; const tail=t.split('Size')[1]||t.slice(-260);
    return tail.replace(/\n{2,}/g,' | ').slice(0,260);
  });
  out.apiFav = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/users/me/files?workspace_id=W4QEF1XTURESO01&scope=own',{credentials:'include'});
    const j=await r.json(); return (j.files||[]).map(f=>({n:f.filename, fav:f.is_favorite}));
  });
  return {...out, net};
};
