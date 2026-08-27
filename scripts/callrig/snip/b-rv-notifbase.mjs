export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://staging.airion-cargo.store/w/${WS}/calls`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(async(ws)=>{
    const n=await (await fetch('/api/v1/notifications?limit=50',{credentials:'include'})).json().catch(()=>null);
    const act=await (await fetch(`/api/v1/workspace/${ws}/meetings/active`,{credentials:'include'})).json().catch(()=>null);
    const raw=JSON.stringify(n||{});
    const bell=[...document.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(a=>a&&/Notification/i.test(a));
    const card=(document.body.innerText.replace(/\s+/g,' ').match(/Live now.{0,180}/)||[])[0]||null;
    const cardBtns=[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.innerText||'').trim()).filter(t=>/^(Join|Admit|Deny|Start call)$/.test(t));
    return {url:location.href, total:n&&n.total, unread:n&&n.unread_count,
      knockMatch: (raw.match(/wait|pending|queue|knock|lobby|admission|request/gi)||[]).length,
      titles:((n&&n.notifications)||[]).map(x=>(x.type||'')+' | '+String(x.title||x.body||'').slice(0,50)).slice(0,10),
      activeKeys: act&&act.meetings&&act.meetings[0]? Object.keys(act.meetings[0]) : null,
      activeRaw: act&&act.meetings&&act.meetings[0]? JSON.stringify(act.meetings[0]).slice(0,400):null,
      bell, card, cardBtns, len:raw.length};
  }, WS);
};
