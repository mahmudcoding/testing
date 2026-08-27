export default async ({page}) => {
  const out={};
  out.urlBefore = page.url().replace(/^https:\/\/[^/]+/,'');
  // 1) does the existing cookie still authenticate?
  out.meLive = await page.evaluate(`(async()=>{ const r=await fetch('/api/v1/auth/me',{credentials:'include'});
     let b=''; try{b=(await r.text()).slice(0,160);}catch(e){} return {st:r.status, b:b.replace(/\\s+/g,' ')}; })()`);
  // 2) does a data endpoint still serve?
  out.dataLive = await page.evaluate(`(async()=>{ const r=await fetch('/api/v1/workspaces/W4QEF1XTURESO01/channels',{credentials:'include'});
     let b=''; try{b=(await r.text()).slice(0,120);}catch(e){} return {st:r.status, b:b.replace(/\\s+/g,' ')}; })()`);
  // 3) did the open tab react on its own?
  await page.waitForTimeout(4000);
  out.urlAfterWait = page.url().replace(/^https:\/\/[^/]+/,'');
  out.screen = await page.evaluate(`(() => ((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ').slice(0,180))()`);
  // 4) and on a hard reload?
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/chat/mentions', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.urlAfterReload = page.url().replace(/^https:\/\/[^/]+/,'');
  out.screenAfterReload = await page.evaluate(`(() => ((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ').slice(0,180))()`);
  return out;
};
