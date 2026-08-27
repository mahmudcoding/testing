const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const sidebarOrder = () => page.evaluate((vs)=>{const vis=eval(vs);
    const s=document.querySelector('[data-testid="chat-sidebar-slot"]')||document.body;
    return [...s.querySelectorAll('a[href*="/c/"],a[href*="/d/"]')].filter(vis)
      .map(a=>(a.innerText||'').replace(/\s+/g,' ').trim().slice(0,18));},VS);

  // --- ALK-2556 / ALK-2828: conversation activity ordering
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.orderBefore = await sidebarOrder();
  const c=await page.$('div[contenteditable="true"][aria-label="Compose message"]');
  if(c){ await c.click(); await page.keyboard.down('Meta'); await page.keyboard.press('a'); await page.keyboard.up('Meta');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('V60-ORDER '+Math.floor(Date.now()/1000%100000),{delay:10}); await page.keyboard.press('Enter'); }
  await page.waitForTimeout(6000);
  out.orderAfter = await sidebarOrder();
  out.orderChanged = JSON.stringify(out.orderBefore)!==JSON.stringify(out.orderAfter);

  // --- ALK-2480 / ALK-2542: People search is scoped to the workspace
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const sb = page.locator('input[placeholder*="Search"]').first();
  if(await sb.count()){ await sb.click(); await page.keyboard.type('Outsider',{delay:50}); await page.waitForTimeout(2500); }
  out.peopleSearch = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const t=(m.innerText||'').replace(/\s+/g,' ');
    return { showsOutsider:/QA Outsider/.test(t), tail:t.slice(-160) };},VS);
  return out;
};
