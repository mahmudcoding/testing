export default async ({page}) => {
  const r = await page.evaluate(async () => {
    const g = async p => { const x = await fetch(p,{credentials:'include'}); return {s:x.status, b:(await x.text()).slice(0,900)}; };
    return {notifs: await g('/api/v1/notifications?limit=10'), current: await g('/api/v1/meetings/current')};
  });
  const ui = await page.evaluate(() => ({
    url: location.href,
    body: document.body.innerText.replace(/\n+/g,' | ').slice(0,600),
    dialogs: [...document.querySelectorAll('[role="dialog"]')].map(d=>d.innerText.replace(/\n+/g,' | ').slice(0,250)),
    toasts: [...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,150)),
    incoming: [...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).filter(t=>/incoming|ring|call/i.test(t)).slice(0,20)
  }));
  return {api: r, ui};
};
