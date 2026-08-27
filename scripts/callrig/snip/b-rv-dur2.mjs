export default async ({page}) => {
  const WS='W4QBF1XTURESO01'; const mid=process.env.QA_MID;
  const out={mid};
  // свернуть звонок в PiP, чтобы маршрут /calls/<id> не подменялся на /call/<id>
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-surface-minimize"]'); if(b) b.click(); });
  await page.waitForTimeout(3000);
  out.urlAfterMinimize = page.url();
  await page.evaluate((u)=>{ history.pushState({},'',u); window.dispatchEvent(new PopStateEvent('popstate')); }, `/w/${WS}/calls/${mid}`).catch(()=>{});
  await page.waitForTimeout(2000);
  // клиентская навигация через клик по строке в Recent calls, если pushState не сработал
  out.urlAfterPush = page.url();
  if (!/\/calls\//.test(page.url())) {
    await page.goto(`https://staging.airion-cargo.store/w/${WS}/calls/${mid}`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
  }
  out.url = page.url();
  out.head = await page.evaluate(()=>{ const m=document.querySelector('main')||document.body; return m.innerText.replace(/\s+/g,' ').slice(0,300); });
  out.viewAll = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button,a')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^View all$/i.test((x.innerText||'').trim())); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(4000);
  out.rows = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog],aside')].filter(x=>x.getBoundingClientRect().width>0).pop();
    const src = d || document.querySelector('main') || document.body;
    return src.innerText.replace(/\n{2,}/g,'\n').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,40);
  });
  return out;
};
