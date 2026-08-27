export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const navItems = () => page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    return [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).map(a=>a.innerText.trim()).filter(Boolean);
  });
  const inp = page.locator('input[placeholder="Filter settings"]');
  const out={found: await inp.count(), all: await navItems()};
  if(!out.found) return out;
  out.cases=[];
  for (const q of ['audit','role','notif','ROLE','xyzzy','  ','au dit','Роли']) {
    await inp.fill(''); await page.waitForTimeout(300);
    if(q.trim()||q) await inp.fill(q);
    await page.waitForTimeout(1000);
    const items = await navItems();
    const empty = await page.evaluate(()=>{
      const t=(document.querySelector('nav')||document.querySelector('aside')||document.body).innerText||'';
      return /no (results|matches)|nothing found|ничего/i.test(t) ? t.replace(/\s+/g,' ').slice(0,80) : null;
    });
    out.cases.push({q, n:items.length, items:items.slice(0,8), emptyState:empty});
  }
  await inp.fill('');
  await page.waitForTimeout(600);
  out.restored = (await navItems()).length;
  return out;
};
