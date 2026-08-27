export default async ({page}) => {
  const url=process.env.QA_URL;
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{
    const vis = e => { const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
      return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'; };
    const find = re => [...document.querySelectorAll('h1,h2,h3,p,span,button')]
      .filter(e=>vis(e)&&re.test(e.innerText||'')&&(e.innerText||'').length<120&&e.children.length<=2)
      .map(e=>({tag:e.tagName, text:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,70),
                y:Math.round(e.getBoundingClientRect().y)}));
    return {
      url: location.href.replace(/^https:\/\/[^/]+/,''),
      msgCount: document.querySelectorAll('[data-message-id]').length,
      msgTexts: [...document.querySelectorAll('[data-message-id]')].map(a=>(a.innerText||'').replace(/\s+/g,' ').slice(0,60)),
      emptyState: find(/Start this channel|Add teammates|Add users/i).slice(0,4),
      pinBanner: find(/no message text|View all \(/i).slice(0,1)
    };
  });
};
