import {WS, BASE} from './e-p2-helpers.mjs';
const rsvp = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  return [...document.querySelectorAll('button')].filter(vis)
    .filter(e=>/^(Yes|No)$/.test((e.textContent||'').trim()))
    .map(e=>({t:e.textContent.trim(), disabled:e.disabled}));
};
async function byLink(page, id){
  await page.goto(`${BASE}/w/${WS}/calendar/${id}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(rsvp);
}
async function byGrid(page, title){
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const ok = await page.evaluate((t)=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const c=[...document.querySelectorAll('button')].filter(vis).find(e=>e.textContent.includes(t));
    if(!c) return false; c.scrollIntoView({block:'center'}); c.click(); return true;
  }, title);
  await page.waitForTimeout(4000);
  return ok? await page.evaluate(rsvp) : 'chip not found';
}
export default async ({page}) => {
  // meta first: which role am I on each meeting?
  const meta = await page.evaluate(async (ws)=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const my=me?.id||me?.user?.id;
    const r=await fetch(`/api/v1/calendar/meetings?workspace_id=${ws}&from=${new Date(Date.now()-86400000).toISOString()}&to=${new Date(Date.now()+2*86400000).toISOString()}`,{credentials:'include'});
    const b=await r.json(); const a=b.meetings||b.data||[];
    const pick=t=>{const m=(Array.isArray(a)?a:[]).find(x=>(x.title||'').includes(t)); return m? {id:m.id, my_status:m.my_status, mine:(m.created_by||m.creator_id)===my}:null;};
    return {notInvited:pick('QA-E Guest probe'), organiser:pick('QA-E Sync 1 renamed'), invitee:pick('Invite seam 2334')};
  }, WS);
  const out={meta};
  if(meta.notInvited) out.notInvited={link:await byLink(page,meta.notInvited.id), grid:await byGrid(page,'QA-E Guest probe')};
  if(meta.organiser)  out.organiser ={link:await byLink(page,meta.organiser.id),  grid:await byGrid(page,'QA-E Sync 1 renamed')};
  return out;
};
