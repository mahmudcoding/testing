const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const c = page.locator('button[aria-label="Close"]').first();
  if(await c.count()){ await c.click().catch(()=>{}); await page.waitForTimeout(1800); }
  await page.waitForTimeout(2500);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/grid10.png'});
  out.state = await page.evaluate((vs)=>{const vis=eval(vs);
    const labels=[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/^(QA (Alice|Bob|Carol|Dave|Owner|Admin)|Visitor \d+)/.test((e.innerText||'').trim()))
      .map(e=>e.innerText.trim().replace(/\s+/g,' ').slice(0,24));
    return { tileLabels:[...new Set(labels)], tileCount:[...new Set(labels)].length,
      capText:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/show more|hidden|\+\d+|more/i.test(e.innerText||''))
        .map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,50)).slice(0,6),
      capBtns:[...document.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,26),al:(b.getAttribute('aria-label')||'').slice(0,30)}))
        .filter(b=>/show more|more|\+\d+/i.test(b.t+b.al)).slice(0,6) };},VS);
  return out;
};
