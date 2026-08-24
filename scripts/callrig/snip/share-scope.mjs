export default async ({page}) => {
  const where = await page.evaluate(() => {
    const b=[...document.querySelectorAll('main button')].find(x=>/^Share$/.test(x.textContent.trim()));
    if(!b) return null;
    const chain=[]; let e=b; for(let i=0;i<7&&e;i++){ e=e.parentElement; if(!e)break; chain.push(`${e.tagName}${e.getAttribute('data-testid')?'['+e.getAttribute('data-testid')+']':''}`); }
    const dl=[...document.querySelectorAll('main button')].find(x=>/^Download$/.test(x.textContent.trim()));
    return {chain, rect: b.getBoundingClientRect().toJSON? null:null,
      siblingsInHeader: b.parentElement? [...b.parentElement.querySelectorAll('button')].map(x=>x.textContent.trim().slice(0,20)):[],
      headerText: b.closest('div')?.parentElement?.innerText.replace(/\n+/g,' | ').slice(0,150)};
  });
  // now switch to Chat tab and press Share again
  const tabs = await page.evaluate(()=>[...document.querySelectorAll('main button')].map(b=>b.textContent.trim().slice(0,20)).filter(Boolean).slice(0,15));
  await page.evaluate(()=>{ window.__clip=null; navigator.clipboard.writeText = async t => { window.__clip=t; }; });
  const chatTab = page.locator('main button', {hasText:/^Chat0$|^Chat/}).first();
  let chatShare = null;
  if (await chatTab.count()) {
    await chatTab.click(); await page.waitForTimeout(2500);
    const sb = page.locator('main button', {hasText:/^Share$/}).first();
    chatShare = {sharePresent: await sb.count()>0, tabText: await page.evaluate(()=>(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,300))};
    if (await sb.count()) { await sb.click(); await page.waitForTimeout(2000); chatShare.copied = await page.evaluate(()=>window.__clip); }
  }
  return {where, tabs, chatShare, urlNow: page.url()};
};
