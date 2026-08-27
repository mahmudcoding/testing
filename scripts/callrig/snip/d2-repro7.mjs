export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const sidebarX = () => page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>60&&r.height>200;};
    // the channel rail/sidebar: widest tall nav-ish column on the left or right
    const cands=[...document.querySelectorAll('nav,aside,[class*=sidebar i],[data-testid*=sidebar]')].filter(vis);
    const m=cands.map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName.toLowerCase(),x:Math.round(r.x),w:Math.round(r.width)};});
    m.sort((a,b)=>b.w-a.w);
    return { vw: innerWidth, top: m.slice(0,3) };
  });
  // step 1
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/appearance`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const opt = await page.$('button:has-text("Right"), [role=radio]:has-text("Right"), label:has-text("Right")');
  out.foundRight = !!opt;
  if (opt) { await opt.click().catch(()=>{}); await page.waitForTimeout(2000); }
  out.selected = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const els=[...document.querySelectorAll('[role=radio],[aria-pressed],button')].filter(vis)
      .filter(e=>/^(Left|Right)$/.test((e.innerText||'').trim()));
    return els.map(e=>({t:(e.innerText||'').trim(), checked:e.getAttribute('aria-checked')||e.getAttribute('aria-pressed')||''}));
  });
  // step 2
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QDGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.inChannel = await sidebarX();
  // step 3
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(4000);
  out.afterReload = await sidebarX();
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/appearance`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  out.selectionAfterReload = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('[role=radio],[aria-pressed],button')].filter(vis)
      .filter(e=>/^(Left|Right)$/.test((e.innerText||'').trim()))
      .map(e=>({t:(e.innerText||'').trim(), checked:e.getAttribute('aria-checked')||e.getAttribute('aria-pressed')||''}));
  });
  return out;
};
