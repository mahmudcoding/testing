import {WS, BASE} from './e-p2-helpers.mjs';
const MID='S4OX2EYG6IHFZ1Q';
export default async ({page}) => {
  const statusOf = async () => await page.evaluate(async ({ws,mid})=>{
    const r=await fetch(`/api/v1/calendar/meetings?workspace_id=${ws}&from=${new Date(Date.now()-86400000).toISOString()}&to=${new Date(Date.now()+2*86400000).toISOString()}`,{credentials:'include'});
    const b=await r.json(); const a=b.meetings||b.data||[];
    const m=(Array.isArray(a)?a:[]).find(x=>x.id===mid);
    return m? m.my_status : '(not found)';
  }, {ws:WS, mid:MID});
  const out={};
  out.statusBefore = await statusOf();
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const c=[...document.querySelectorAll('button')].filter(vis).find(e=>/Invite seam 2334/.test(e.textContent||''));
    c&&c.scrollIntoView({block:'center'}); c&&c.click();
  });
  await page.waitForTimeout(4000);
  const reqs=[]; const h=async r=>{const rq=r.request();
    if(/respond|rsvp|meetings\//.test(rq.url()) && rq.method()!=='GET')
      reqs.push(rq.method()+' '+rq.url().replace(/https?:\/\/[^/]+/,'').slice(0,70)+' -> '+r.status()
        +' BODY '+(rq.postData()||'').slice(0,80));};
  page.on('response',h);
  const yes = page.locator('button').filter({hasText:/^Yes$/}).first();
  out.yesDisabled = await yes.isDisabled();
  await yes.click();
  await page.waitForTimeout(5000);
  page.off('response',h);
  out.requests = reqs;
  out.statusAfter = await statusOf();
  out.uiAfter = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const b=[...document.querySelectorAll('button')].filter(vis)
      .filter(e=>/^(Yes|No)$/.test((e.textContent||'').trim()))
      .map(e=>({t:e.textContent.trim(), pressed:e.getAttribute('aria-pressed'),
        cls:(e.className||'').toString().slice(-40), bg:getComputedStyle(e).backgroundColor}));
    return b;
  });
  return out;
};
