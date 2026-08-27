// Visit a list of routes and report the gate state on each. QA_ROUTES = ; separated paths
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const routes = (process.env.QA_ROUTES||'').split(';').filter(Boolean);
  const out = [];
  for (const r of routes) {
    const seen=[]; const on=x=>{try{const u=new URL(x.url()); if(u.pathname.startsWith('/api/v1/')) seen.push(`${x.request().method()} ${u.pathname}${u.search} -> ${x.status()}`);}catch{}};
    page.on('response', on);
    await page.goto('https://airion-cargo.store'+r.replace('{ws}',WS), {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    const reqs = seen.slice(); page.off('response', on);
    const d = await page.evaluate(() => {
      const vis = el => { const b=el.getBoundingClientRect(); if(b.width<1||b.height<1) return false;
        let n=el,o=1; while(n&&n!==document.documentElement){const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden')return false; o*=parseFloat(c.opacity||'1'); n=n.parentElement;} return o>0.01; };
      const main = document.querySelector('main') || document.body;
      const heads = [...main.querySelectorAll('h1,h2,h3')].filter(vis).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,60));
      const ctrls = [...main.querySelectorAll('button,input,select,a[href],[role=combobox],[role=switch],[role=tab]')].filter(vis)
        .map(e=>`${e.tagName.toLowerCase()}${e.disabled?'(dis)':''}:${(e.getAttribute('aria-label')||e.innerText||e.getAttribute('placeholder')||'').replace(/\s+/g,' ').trim().slice(0,38)}`);
      const nav = [...document.querySelectorAll('nav a, aside a')].filter(vis).map(e=>e.innerText.trim()).filter(Boolean);
      return {heads:[...new Set(heads)], ctrlN: ctrls.length, ctrls: ctrls.slice(0,25),
              nav:[...new Set(nav)], txt:(main.innerText||'').replace(/\s+/g,' ').slice(0,420)};
    });
    const bad = reqs.filter(x=>/-> (4|5)\d\d$/.test(x));
    out.push({route:r, heads:d.heads, ctrlN:d.ctrlN, ctrls:d.ctrls, txt:d.txt, nonOk: bad, nav: d.nav});
  }
  return out;
};
