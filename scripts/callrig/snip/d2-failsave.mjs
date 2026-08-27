import { watchNotices } from './lib.mjs';
// Abort one endpoint and see whether a failed save is reported to the user.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const which = process.env.QA_CASE || 'workspace';
  const cfg = {
    workspace: {url:`/w/${WS}/settings/workspace`, route:'**/api/v1/workspaces/W4QDF1XTURESO01',
                act: async p=>{ const i=p.locator('main input[type=text]').first();
                                await i.fill('QA Workspace D offline probe'); await p.waitForTimeout(600); },
                save:/^(Save changes|Save)$/},
    company:   {url:`/w/${WS}/settings/company`, route:'**/api/v1/companies/O4QDF1XTURESO01',
                act: async p=>{ const i=p.locator('main input[placeholder="Acme Inc"]').first();
                                await i.fill('QA Fixtures D offline probe'); await p.waitForTimeout(600); },
                save:/^(Save changes|Save)$/},
    notif:     {url:`/w/${WS}/settings/notifications`, route:'**/api/v1/notifications/settings',
                act: async p=>{ await p.locator('[role=switch]').nth(1).click(); await p.waitForTimeout(600); },
                save:/^(Save preferences|Save changes|Save)$/},
  }[which];
  await page.goto('https://airion-cargo.store'+cfg.url,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const out={case:which};
  await page.route(cfg.route, r => r.abort('failed'));
  await cfg.act(page);
  out.saveBar = await page.evaluate(()=>[...document.querySelectorAll('main button')]
    .map(b=>`${b.disabled?'(dis)':''}${b.innerText.trim().slice(0,20)}`).filter(t=>/Save|Discard/i.test(t)));
  const failed=[]; page.on('requestfailed', r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) failed.push(r.method()+' '+u.pathname);}catch{}});
  out.notices = await watchNotices(page,{ms:14000, trigger: async()=>{
    const s=page.locator('main button').filter({hasText:cfg.save}).last();
    if(await s.count()){ await s.scrollIntoViewIfNeeded(); await s.click(); } else out.noSave=true;
  }});
  out.abortedRequests = failed;
  await page.unroute(cfg.route);
  out.saveBarAfter = await page.evaluate(()=>[...document.querySelectorAll('main button')]
    .map(b=>`${b.disabled?'(dis)':''}${b.innerText.trim().slice(0,20)}`).filter(t=>/Save|Discard/i.test(t)));
  return out;
};
