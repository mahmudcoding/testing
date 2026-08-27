export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const r = await page.evaluate(() => {
    const m = document.querySelector('main')||document.body;
    const sched = m.querySelector('[data-testid="calls-scheduled-today"]');
    const block = sched ? sched.innerText.replace(/\n+/g,' | ').slice(0,400) : null;
    const btns = sched ? [...sched.querySelectorAll('button,a')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30), d:b.disabled, href:b.getAttribute('href')})) : [];
    return {url: location.href, sched: block, btns, now: new Date().toISOString()};
  });
  const notif = await page.evaluate(async () => {
    try { const j = await (await fetch('/api/v1/notifications?limit=4',{credentials:'include'})).json();
      return (j.notifications||j.items||[]).map(n=>({t:n.type, title:n.title, b:(n.body||'').slice(0,70), at:n.created_at})); } catch(e){return String(e).slice(0,50);}
  });
  return {...r, notif};
};
