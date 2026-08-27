import { watchNotices, safeClick } from './lib.mjs';
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const out={};
  out.before = await page.evaluate(async()=>await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).json());
  out.click = (await safeClick(page,'[role=switch]',{index:0})).ok;
  await page.waitForTimeout(1200);
  out.saveBar = await page.evaluate(()=>[...document.querySelectorAll('main button')]
    .map(b=>`${b.disabled?'(dis)':''}${b.innerText.trim().slice(0,22)}`).filter(t=>/Save|Discard/i.test(t)));
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(r.request().method()!=='GET'&&u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  out.notices = await watchNotices(page,{ms:12000, trigger: async()=>{
    const s=page.locator('main button').filter({hasText:/^(Save preferences|Save changes|Save)$/}).last();
    if (await s.count()) { await s.scrollIntoViewIfNeeded(); await s.click(); } else out.noSaveButton=true;
  }});
  page.off('response', on);
  out.reqs=reqs;
  await page.waitForTimeout(1500);
  out.switchAfter = await page.evaluate(()=>document.querySelectorAll('[role=switch]')[0].getAttribute('aria-checked'));
  out.api = await page.evaluate(async()=>await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).json());
  return out;
};
