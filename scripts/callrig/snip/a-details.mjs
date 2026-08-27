export default async ({page}) => {
  const id = process.env.QA_MEET;
  const out = {};
  out.agg = await page.evaluate(async (id) => {
    const j = await (await fetch('/api/v1/meeting/'+id,{credentials:'include'})).json();
    return (j.meeting||j).rating;
  }, id);
  const net=[];
  page.on('request', r=>{ const u=r.url(); if(u.includes('/api/v1/') && /meeting|recent|history/i.test(u)) net.push(r.method()+' '+u.replace('https://airion-cargo.store','').slice(0,140)); });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls/'+id, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.detail = await page.evaluate(() => {
    const m=document.querySelector('main')||document.body;
    return {url: location.href, text: m.innerText.replace(/\n+/g,' | ').slice(0,900),
      tabs: [...m.querySelectorAll('[role="tab"]')].map(t=>t.textContent.trim()),
      hasStar: !!m.querySelector('[data-testid*="rat"], [aria-label*="star" i]'),
      ratingText: (m.innerText.match(/[Rr]ating[^|]{0,60}/g)||[]).slice(0,3)};
  });
  out.net = [...new Set(net)];
  return out;
};
