export default async ({page}) => {
  const r1 = await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    const ctrls=[...document.querySelectorAll('button,a,input,select,[role="button"]')].filter(v)
      .filter(e=>e.getBoundingClientRect().left>W*0.7)
      .map(e=>`${e.tagName.toLowerCase()}:${(e.getAttribute('aria-label')||e.innerText||e.getAttribute('placeholder')||'').replace(/\s+/g,' ').trim().slice(0,30)}`);
    return [...new Set(ctrls)];
  });
  // hover the first member row to reveal any row actions
  const row = page.locator('button,li,div').filter({hasText:/^QA Bob$/}).last();
  let hovered='no';
  try { await row.scrollIntoViewIfNeeded({timeout:3000}); await row.hover({timeout:4000}); hovered='ok'; } catch(e){ hovered='FAIL'; }
  await page.waitForTimeout(2000);
  const r2 = await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    return [...new Set([...document.querySelectorAll('button,a,[role="button"]')].filter(v)
      .filter(e=>e.getBoundingClientRect().left>W*0.7)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30)))];
  });
  return {paneControls:r1, hovered, afterHover:r2.filter(x=>!r1.some(y=>y.endsWith(x)))};
};
