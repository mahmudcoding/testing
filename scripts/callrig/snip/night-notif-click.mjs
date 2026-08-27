export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  for(const b of await page.$$('button')){ const l=((await b.getAttribute('aria-label'))||'').trim();
    if(/^Notifications/.test(l)){ await b.click(); break; } }
  await page.waitForTimeout(4500);
  const listed = await page.evaluate(()=>{
    const p=[...document.querySelectorAll('*')].find(e=>/Mark all as read/.test(e.textContent||'') && e.children.length<8);
    let box=p; for(let i=0;i<6&&box&&box.parentElement;i++){ box=box.parentElement; if((box.innerText||'').length>80) break; }
    return box?box.innerText.replace(/\n+/g,' | ').slice(0,260):null;});
  // click the first notification row
  let clicked=null;
  const rows=await page.$$('[role="dialog"] button, aside button, [data-radix-popper-content-wrapper] button');
  for(const r of rows){ const t=((await r.innerText())||'').replace(/\s+/g,' ').trim();
    if(new RegExp(process.env.QA_MATCH||'call','i').test(t) && t.length>8 && t.length<90){ await r.click(); clicked=t.slice(0,60); break; } }
  await page.waitForTimeout(6000);
  return {listed, clicked, url:page.url().replace(/^https:\/\/[^/]+/,''),
    main: await page.evaluate(()=>(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,140))};
};
