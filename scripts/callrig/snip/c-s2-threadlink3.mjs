export default async ({page}) => {
  const url='https://airion-cargo.store/w/W4QCF1XTURESO01/c/C4QCGENERAL0001?m=M4OWUEC5WS5JKBO&thread=M4OWSWLE61Y8WAA';
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(url);
  const s=[];
  for(let i=0;i<16;i++){ await page.waitForTimeout(700);
    s.push(await page.evaluate(()=>{
      const t=document.querySelector('[data-message-id="M4OWUEC5WS5JKBO"]');
      const r=t?t.getBoundingClientRect():null;
      const vis=(x)=>{const rr=x.getBoundingClientRect();return rr.width>4&&rr.height>4;};
      return {present:!!t,
        inViewport: r? (r.y>0 && r.y<window.innerHeight):null,
        x: r?Math.round(r.x):null, y:r?Math.round(r.y):null,
        highlight: t? getComputedStyle(t).backgroundColor:null,
        panelOpen: location.search.includes('thread='),
        replies: (()=>{const e=[...document.querySelectorAll('*')].find(x=>/^Replies \(/.test((x.textContent||'').trim())&&vis(x));
          return e?(e.textContent||'').trim().slice(0,16):null;})(),
        notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
          .map(x=>x.textContent.trim().slice(0,40))};
    }));
  }
  out.first=s[0]; out.last=s.at(-1);
  out.everPresent=s.some(x=>x.present);
  out.everInViewport=s.some(x=>x.inViewport);
  out.highlights=[...new Set(s.map(x=>x.highlight).filter(Boolean))];
  out.noticesSeen=[...new Set(s.flatMap(x=>x.notices))];
  return out;
};
