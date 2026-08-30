import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM).catch(()=>{});
  return await page.evaluate(async () => {
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>({}));
    const cur = await (await fetch('/api/v1/meetings/current',{credentials:'include'})).text();
    return { who: me?.user?.email ?? me?.email ?? null, url: location.pathname,
             screen: document.querySelector('[data-testid="call-overlay-expanded"]') ? 'in-call'
                   : document.querySelector('[data-testid="lobby-page"]') ? 'lobby' : 'other',
             current: cur.slice(0, 120) };
  });
};
