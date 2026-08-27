export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001', id='M4OXEWL01S5558H';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const msg=page.locator(`[data-message-id="${id}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  const st=(label)=>page.evaluate((label)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const menus=[...document.querySelectorAll('[role="menu"]')].filter(v);
    const t=[...document.querySelectorAll('[role="menuitem"]')].filter(v)
      .find(e=>/^Seen by/.test((e.innerText||'').trim()));
    const list=[...document.querySelectorAll('[role="menu"],[role="group"]')].filter(v)
      .find(e=>/seen/i.test(e.getAttribute('aria-label')||''));
    return {label, menusOpen:menus.length, triggerPresent:!!t,
      expanded:t?t.getAttribute('aria-expanded'):null,
      listRows:list?[...list.children].map(c=>(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,34)):null};}, label);
  const out={afterMenuOpen:await st('menu open')};
  const trig=page.locator('[role="menuitem"]').filter({hasText:/^Seen by/}).first();
  await trig.hover({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  out.afterHover=await st('after hover');
  await trig.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  out.afterClick1=await st('after click 1');
  if(out.afterClick1.triggerPresent){
    await trig.click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(2500);
    out.afterClick2=await st('after click 2');
  }
  return out;
};
