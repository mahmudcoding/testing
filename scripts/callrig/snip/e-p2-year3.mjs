import {WS, BASE} from './e-p2-helpers.mjs';
const head = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const m=document.querySelector('main');
  // the heading is the first visible leaf that mentions a month name
  const MON='January|February|March|April|May|June|July|August|September|October|November|December';
  const leaf=[...m.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
    && new RegExp(MON).test(e.textContent||''))
    .sort((a,b)=>a.getBoundingClientRect().y-b.getBoundingClientRect().y)[0];
  return leaf? leaf.textContent.replace(/\s+/g,' ').trim().slice(0,44) : '(none)';
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.locator('main button').filter({hasText:/^Week$/}).first().click();
  await page.waitForTimeout(2800);
  const seq=[await page.evaluate(head)];
  const reqs=[]; const h=r=>{const u=r.url(); if(/\/calendar\/meetings\?/.test(u)&&/from=/.test(u))
    reqs.push(decodeURIComponent(u).replace(/.*from=/,'from=').replace(/&workspace_id=[^&]*/,'').slice(0,70));};
  page.on('request',h);
  for(let i=0;i<20;i++){
    await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
        .find(e=>/next/i.test(e.getAttribute('aria-label')||'')); b&&b.click();
    });
    await page.waitForTimeout(1700);
    seq.push(await page.evaluate(head));
  }
  page.off('request',h);
  return {weeks:seq.slice(-8), lastRequests:reqs.slice(-4), total:seq.length};
};
