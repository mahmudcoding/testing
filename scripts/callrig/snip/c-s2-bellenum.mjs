export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  const bell=page.locator('button[aria-label^="Notifications"]').first();
  const found=await bell.count();
  if(!found) return {err:'no bell'};
  await bell.click(); await page.waitForTimeout(3500);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    // find the container that actually holds notification text
    const cands=[...document.querySelectorAll('div,aside,section,[role="dialog"]')].filter(v)
      .filter(d=>/New thread reply|New channel message|You were mentioned/.test(d.innerText||''));
    cands.sort((a,b)=>(a.getBoundingClientRect().height*a.getBoundingClientRect().width)
                     -(b.getBoundingClientRect().height*b.getBoundingClientRect().width));
    const panel=cands[0];
    if(!panel) return {note:'no notification container found',
      bodyHasText:/New thread reply/.test(document.body.innerText||'')};
    const r=panel.getBoundingClientRect();
    return {panelTag:panel.tagName, panelRect:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],
      panelText:(panel.innerText||'').replace(/\s+/g,' ').slice(0,180),
      clickables:[...panel.querySelectorAll('button,a,[role="button"],li')].filter(v)
        .map(e=>({tag:e.tagName, t:(e.innerText||'').replace(/\s+/g,' ').slice(0,44),
          al:e.getAttribute('aria-label')})).slice(0,8)};});
};
