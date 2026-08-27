export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/chat/saved',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const m = await page.evaluate(()=>{
    const vis = e => { const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
      return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'; };
    const find = re => [...document.querySelectorAll('h1,h2,h3,p,span,button,div')]
      .filter(e=>vis(e)&&re.test(e.innerText||'')&&(e.innerText||'').length<120&&e.children.length<=2)
      .map(e=>({tag:e.tagName, text:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,80),
                y:Math.round(e.getBoundingClientRect().y)}));
    return {
      heading:(document.querySelector('h1,h2')?.innerText||'').slice(0,40),
      emptyState: find(/Start this channel|Add teammates|Add users/i).slice(0,4),
      pinBanner: find(/no message text|View all \(/i).slice(0,2),
      msgCount: document.querySelectorAll('[data-message-id]').length,
      msgTexts: [...document.querySelectorAll('[data-message-id]')].map(a=>(a.innerText||'').replace(/\s+/g,' ').slice(0,70)),
      composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')
    };
  });
  return m;
};
