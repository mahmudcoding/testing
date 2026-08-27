export default async ({page}) => {
  const out={};
  const link=page.locator('main a').filter({hasText:'View original'}).first();
  out.count=await link.count();
  if(!out.count) return out;
  await link.scrollIntoViewIfNeeded().catch(()=>{});
  await link.click({timeout:8000}).catch(e=>{out.clickFail=String(e.message).slice(0,40);});
  await page.waitForTimeout(9000);
  out.after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const main=document.querySelector('main');
    const txt=main?(main.innerText||''):'';
    return {url:location.pathname+location.search,
      tombstoneVisible:txt.includes('was deleted'),
      olderBanner:/older than loaded history|Message older/i.test(txt),
      notFound:/not found|no longer|unavailable/i.test(txt),
      mainTail:txt.replace(/\s+/g,' ').trim().slice(-140),
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,60)).filter(Boolean).slice(0,2),
      highlighted:document.querySelectorAll('[data-message-id][class*=highlight],[data-highlighted]').length};});
  return out;
};
