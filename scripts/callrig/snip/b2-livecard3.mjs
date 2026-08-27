export default async ({ page }) => {
  const api = await page.evaluate(async () => {
    const ws='W4QBF1XTURESO01';
    const r = await fetch(`/api/v1/workspace/${ws}/meetings/active`, {credentials:'include'});
    const t = await r.text();
    return { count: (t.match(/"participant_count":(\d+)/)||[])[1],
             name: (t.match(/"name":"([^"]*)"/)||[])[1],
             tops: (t.match(/"top_participants":\[(.*?)\]/)||[])[1]?.split('},{').length };
  });
  const dom = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const cand = [...document.querySelectorAll('div,li,section')].filter(v)
      .filter(e=>/LIVE/.test(e.innerText||'') && /participant/i.test(e.innerText||'')
                 && (e.innerText||'').length < 260);
    const min = cand.filter(e=>!cand.some(o=>o!==e && e.contains(o)));
    const card = min[min.length-1];
    return card ? { text: card.innerText.replace(/\n+/g,' | ').slice(0,160),
                    buttons: [...card.querySelectorAll('button')].filter(v)
                      .map(b=>(b.innerText||'').trim().slice(0,20)).filter(Boolean) }
                : { text: '(no live card found)', buttons: [] };
  });
  return { api, dom };
};
