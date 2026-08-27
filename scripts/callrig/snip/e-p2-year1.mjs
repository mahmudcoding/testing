import {WS, BASE} from './e-p2-helpers.mjs';
const head = () => {
  const m=document.querySelector('main')||document.body;
  const t=m.innerText.replace(/\s+/g,' ');
  return (t.match(/[A-Z][a-z]+ \d{4}|\d{1,2}[–-]\d{1,2} \w+ \d{4}|\w+ \d{1,2}[–-]\d{1,2} \w* ?\d{4}/)||[''])[0];
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.locator('main button').filter({hasText:/^Month$/}).first().click();
  await page.waitForTimeout(3000);
  const reqs=[]; const h=r=>{const u=r.url(); if(/\/calendar\/meetings\?/.test(u)&&/from=/.test(u))
    reqs.push(decodeURIComponent(u).replace(/.*from=/,'from=').replace(/&workspace_id=[^&]*/,'').slice(0,90));};
  page.on('request',h);
  const seq=[{step:'start', head: await page.evaluate(head)}];
  // find the "next" navigation control by enumerating, not guessing
  const nav = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    return [...m.querySelectorAll('button')].filter(vis)
      .map(e=>({l:(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,26)}))
      .filter(o=>/next|prev|previous|forward|back|›|‹|→|←/i.test(o.l));
  });
  for (let i=0;i<6;i++){
    const ok = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const m=document.querySelector('main');
      const b=[...m.querySelectorAll('button')].filter(vis)
        .find(e=>/next/i.test(e.getAttribute('aria-label')||''));
      if(b){ b.click(); return true; } return false;
    });
    if(!ok) break;
    await page.waitForTimeout(2200);
    seq.push({step:'next '+(i+1), head: await page.evaluate(head)});
  }
  page.off('request',h);
  return {navControls:nav, seq, requests:reqs.slice(-6)};
};
