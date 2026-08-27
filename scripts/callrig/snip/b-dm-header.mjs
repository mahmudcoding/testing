export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/d/C4OUWJID5OCFYYO',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const header = await page.evaluate(()=>[...document.querySelectorAll('button')]
    .filter(b=>{const r=b.getBoundingClientRect(); return r.width>0&&r.height>0&&r.y<130;})
    .map(b=>({l:(b.getAttribute('aria-label')||'').slice(0,34), t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,20),
              y:Math.round(b.getBoundingClientRect().y)})));
  // try opening a kebab / more menu in the header
  const opened = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>{const r=x.getBoundingClientRect();
      return r.width>0&&r.y<130&&/more|options|menu|details|info/i.test(x.getAttribute('aria-label')||'');})[0];
    if(!b) return null; const l=b.getAttribute('aria-label'); b.click(); return l;
  });
  await page.waitForTimeout(2500);
  const menu = await page.evaluate(()=>{
    const items=[...document.querySelectorAll('[role=menuitem],[role=dialog] button')]
      .filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26));
    return items.slice(0,14);
  });
  return {header, opened, menu};
};
