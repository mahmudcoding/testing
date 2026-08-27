// (a) submit a very long role name; (b) measure the duplicate-name notices rigorously.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const out={};
  const go = async () => { await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=company`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
    await page.evaluate(()=>{const b=document.querySelectorAll('input[type=checkbox]')[5]; if(b&&!b.checked) b.click();});
    await page.waitForTimeout(400); };

  // --- (a) long name ---
  await go();
  const LONG='QA-D2-long-'+'Z'.repeat(189);          // 200 chars
  await page.locator('main input[placeholder="e.g. Moderators"]').first().fill(LONG);
  await page.waitForTimeout(600);
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  await page.locator('main button').filter({hasText:/^Create role$/}).first().click();
  await page.waitForTimeout(5000); page.off('response', on);
  out.longName = {typed:LONG.length, reqs:reqs.filter(r=>/role/i.test(r))};
  out.longName.row = await page.evaluate(()=>{
    const m=document.querySelector('main');
    for(const tr of m.querySelectorAll('tr')) if((tr.innerText||'').includes('QA-D2-long-')) {
      const c=tr.querySelector('td');
      return {cellText:(c?c.innerText:'').replace(/\s+/g,' ').slice(0,60),
              scrollW:c?c.scrollWidth:null, clientW:c?c.clientWidth:null,
              tableOverflow: document.documentElement.scrollWidth>document.documentElement.clientWidth};
    }
    return null;
  });

  // --- (b) duplicate notices, polled from before the click, max opacity kept ---
  await go();
  await page.locator('main input[placeholder="e.g. Moderators"]').first().fill('Member');
  await page.waitForTimeout(500);
  await page.evaluate(()=>{ window.__n=[];
    window.__id=setInterval(()=>{
      for(const e of document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')){
        const t=(e.textContent||'').replace(/\s+/g,' ').trim(); if(!t) continue;
        const r=e.getBoundingClientRect();
        let n=e,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1'); n=n.parentElement;}
        const cls=(typeof e.className==='string'?e.className:'');
        const key=t+'|'+Math.round(r.width)+'x'+Math.round(r.height)+'|'+cls.slice(0,20);
        const p=window.__n.find(x=>x.key===key);
        if(p){p.maxOp=Math.max(p.maxOp,o); p.n++;}
        else window.__n.push({key,txt:t.slice(0,60),w:Math.round(r.width),h:Math.round(r.height),cls:cls.slice(0,30),maxOp:o,n:1});
      }},150);
  });
  await page.waitForTimeout(400);
  await page.locator('main button').filter({hasText:/^Create role$/}).first().click();
  await page.waitForTimeout(6000);
  out.dupNotices = await page.evaluate(()=>{clearInterval(window.__id); return window.__n;});
  return out;
};
