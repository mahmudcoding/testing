import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const reqs=[]; const h=r=>{const u=r.url(); if(/\/calendar\/meetings\?/.test(u)&&/from=/.test(u)) reqs.push(decodeURIComponent(u));};
  page.on('request',h);
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.locator('main button').filter({hasText:/^Day$/}).first().click();
  await page.waitForTimeout(4500);
  page.off('request',h);
  const ui = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    const t=m.innerText.replace(/\s+/g,' ');
    const chips=[...m.querySelectorAll('[data-testid="calendar-event-chip"],button')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim())
      .filter(x=>/QA-E|E2 |standup|probe|Sync|Check|Invite/i.test(x));
    return {heading:(t.match(/(MON|TUE|WED|THU|FRI|SAT|SUN)[A-Z]*DAY \d{1,2} \w+ \d{4}/i)||[''])[0],
      summary:(t.match(/meetings \d+ h [\d.]+/)||[''])[0],
      chipCount:chips.length, chips:[...new Set(chips)].slice(0,12)};
  });
  const api = await page.evaluate(async (url)=>{
    const r=await fetch(url,{credentials:'include'});
    const b=await r.json(); const a=b.meetings||b.data||[];
    return {n:(Array.isArray(a)?a:[]).length,
      titles:(Array.isArray(a)?a:[]).map(x=>(x.title||'').slice(0,26))};
  }, reqs[reqs.length-1]);
  return {requestUsed: (reqs[reqs.length-1]||'').replace(/https?:\/\/[^/]+/,'').replace(/workspace_id=[^&]*/,'workspace_id=<WS>'),
    ui, apiCount:api.n, apiTitles:api.titles.slice(0,12),
    agree: ui.summary.includes(String(api.n))};
};
