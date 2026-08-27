export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.active = await page.evaluate(async(ws)=>{ const r=await fetch(`/api/v1/workspace/${ws}/meetings/active`,{credentials:'include'}); const j=await r.json().catch(()=>null); const a=(j&&(j.meetings||j.items))||(Array.isArray(j)?j:[]); return {status:r.status, n:Array.isArray(a)?a.length:'?'}; }, WS);
  out.cards = await page.evaluate(()=>{
    const vis = el => el.getBoundingClientRect().width>0;
    return [...document.querySelectorAll('button,[role=button],a')].filter(vis)
      .filter(b=>/Team meeting|Webinar/i.test(b.innerText||''))
      .map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,60), tag:b.tagName,
                disabled:b.disabled, ariaDis:b.getAttribute('aria-disabled'),
                pe:getComputedStyle(b).pointerEvents, cursor:getComputedStyle(b).cursor,
                tabindex:b.getAttribute('tabindex')}));
  });
  // click the Webinar card and see if anything happens
  out.beforeUrl = page.url();
  out.clicked = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button,[role=button],a')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/Webinar/i.test(x.innerText||'')); if(b){ b.click(); return true;} return false; });
  await page.waitForTimeout(3500);
  out.afterClick = await page.evaluate(()=>({url:location.href,
    dialogs:[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).map(x=>x.innerText.replace(/\s+/g,' ').slice(0,120)),
    toast:(document.body.innerText.match(/.{0,50}(not available|coming soon|soon).{0,50}/i)||[])[0]||null}));
  return out;
};
