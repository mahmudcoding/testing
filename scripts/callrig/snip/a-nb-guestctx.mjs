export default async ({browser}) => {
  const link = process.env.QA_LINK;
  try {
    const c = await browser.newContext();
    const p = await c.newPage();
    await p.goto(link, {waitUntil:'domcontentloaded'});
    await p.waitForTimeout(7000);
    const st = await p.evaluate(()=>({path:location.pathname.slice(0,60),
      txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,220)}));
    return {ok:true, st};
  } catch(e) { return {err:String(e).slice(0,160)}; }
};
