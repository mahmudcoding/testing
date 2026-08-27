import {WS, BASE} from './e-p2-helpers.mjs';
const members = async (page, id) => await page.evaluate(async (cid)=>{
  const r=await fetch(`/api/v1/channels/${cid}/members`,{credentials:'include'});
  const b=await r.json(); const a=b.members||b.data||(Array.isArray(b)?b:[]);
  return Array.isArray(a)? a.length : null;
}, id);
export default async ({page}) => {
  const CH='C4QEEMPTY000001';
  const out={};
  await page.goto(`${BASE}/w/${WS}/directories?tab=channels`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.membersBefore = await members(page, CH);
  const reqs=[]; const h=async r=>{const rq=r.request();
    if(rq.method()!=='GET' && /\/channels\//.test(rq.url()))
      reqs.push(rq.method()+' '+rq.url().replace(/https?:\/\/[^/]+/,'').slice(0,60)+' -> '+r.status());};
  page.on('response',h);
  const join = page.locator('main button').filter({hasText:/^Join$/}).first();
  out.joinFound = await join.count();
  if(out.joinFound){ await join.click(); await page.waitForTimeout(4000); }
  page.off('response',h);
  out.joinRequests = reqs;
  out.membersAfterJoin = await members(page, CH);
  out.sidebarHasIt = await page.evaluate(()=>[...document.querySelectorAll('a')]
    .some(a=>/qa-empty/.test(a.textContent||'')));
  // restore: leave again
  const reqs2=[]; const h2=async r=>{const rq=r.request();
    if(rq.method()!=='GET' && /\/channels\//.test(rq.url()))
      reqs2.push(rq.method()+' '+rq.url().replace(/https?:\/\/[^/]+/,'').slice(0,60)+' -> '+r.status());};
  page.on('response',h2);
  const left = await page.evaluate(async (cid)=>{
    const r=await fetch(`/api/v1/channels/${cid}/leave`,{method:'POST',credentials:'include'});
    return r.status;
  }, CH);
  page.off('response',h2);
  out.leaveStatus = left;
  out.membersAfterLeave = await members(page, CH);
  out.restored = out.membersAfterLeave===out.membersBefore;
  return out;
};
