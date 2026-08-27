export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  const dm=await page.evaluate(()=>{const a=[...document.querySelectorAll('a[href*="/d/"]')]
    .find(x=>/Carol/.test(x.innerText||'')); return a&&a.getAttribute('href');});
  out.dm=dm;
  if(!dm) return out;
  await page.goto('https://airion-cargo.store'+dm); await page.waitForTimeout(6000);
  const msgs=page.locator('main [data-message-id]');
  const n=await msgs.count();
  out.count=n;
  const inspect=async(idx)=>{
    const el=msgs.nth(idx);
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
    const inline=await el.evaluate(e=>[...e.querySelectorAll('button')]
      .filter(b=>b.getBoundingClientRect().height>4)
      .map(b=>b.getAttribute('aria-label')).filter(Boolean));
    let menu=[];
    const more=el.locator('button[aria-label="More actions"]');
    if(await more.count()){ await more.first().click({force:true}); await page.waitForTimeout(700);
      menu=await page.evaluate(()=>{const m=document.querySelector('[role="menu"]');
        return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,12):[];});
      await page.keyboard.press('Escape'); await page.waitForTimeout(400); }
    const mine=await el.evaluate(e=>/Open QA Alice/.test([...e.querySelectorAll('button')]
      .map(b=>b.getAttribute('aria-label')||'').join(' ')));
    return {idx, mine, inline, menu};
  };
  out.last  = await inspect(n-1);
  out.other = await inspect(Math.max(0,n-2));
  return out;
};
