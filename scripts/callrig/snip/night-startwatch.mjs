export default async ({page}) => {
  const name = process.env.QA_NAME || 'QA-NIGHT-X';
  const trace = [];
  const nav = [];
  page.on('framenavigated', f => { if (f === page.mainFrame()) nav.push({t: Date.now(), url: f.url()}); });
  const snap = (tag) => page.evaluate((tag) => ({
    tag, url: location.href,
    txt: (document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,180),
    btns: [...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean).slice(0,14)
  }), tag);

  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  trace.push(await snap('hub'));
  await page.click('[data-testid="calls-hub-start-now"]');
  await page.waitForTimeout(1500);
  trace.push(await snap('dialog'));
  await page.fill('#calls-hub-call-name', name);
  await page.click('[data-testid="calls-start-submit"]');
  for (const ms of [1000, 2000, 4000, 8000, 15000]) {
    await page.waitForTimeout(ms === 1000 ? 1000 : ms - trace.filter(x=>x.tag.startsWith('+')).reduce((a,b)=>0,0));
    trace.push(await snap('+'+ms+'ms'));
  }
  const api = await page.evaluate(async () => {
    const cur = await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();
    return cur.meeting ? {id:cur.meeting.id, name:cur.meeting.name, status:cur.meeting.status} : cur;
  });
  return {trace, nav: nav.map(n=>n.url), api};
};
