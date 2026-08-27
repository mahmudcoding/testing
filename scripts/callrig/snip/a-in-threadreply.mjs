export default async ({page}) => {
  const dlgSel = '[role="dialog"]';
  const found = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .find(x=>/Message thread/.test(x.innerText||''));
    if(!d) return {err:'no thread dialog'};
    const i=[...d.querySelectorAll('textarea,input')].filter(vis)[0];
    return {ok:true, placeholder:i?(i.placeholder||i.getAttribute('aria-label')):null};
  });
  if(found.err) return found;
  const sel='[role="dialog"] textarea, [role="dialog"] input[type="text"], [role="dialog"] input:not([type])';
  const el = await page.$(sel);
  if(!el) return {found, err:'no reply input'};
  await el.click(); await el.fill(''); await el.type(process.env.QA_REPLY||'thread-reply-B1',{delay:20});
  await page.waitForTimeout(400);
  await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).find(x=>/Message thread/.test(x.innerText||''));
    const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/Send reply/i.test((x.getAttribute('aria-label')||x.textContent||'')));
    if(b)b.click();});
  await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).find(x=>/Message thread/.test(x.innerText||''));
    return d?(d.innerText||'').replace(/\s+/g,' ').slice(0,220):null;});
  return {found, after};
};
