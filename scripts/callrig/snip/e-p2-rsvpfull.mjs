import {WS, BASE} from './e-p2-helpers.mjs';
const MID='S4OX2EYG6IHFZ1Q';
export default async ({page}) => {
  const out={};
  const status = async () => await page.evaluate(async ({ws,mid})=>{
    const r=await fetch(`/api/v1/calendar/meetings?workspace_id=${ws}&from=${new Date(Date.now()-86400000).toISOString()}&to=${new Date(Date.now()+2*86400000).toISOString()}`,{credentials:'include'});
    const b=await r.json(); const a=b.meetings||b.data||[];
    const m=(Array.isArray(a)?a:[]).find(x=>x.id===mid);
    return m? {my_status:m.my_status, title:(m.title||'').slice(0,24)} : null;
  }, {ws:WS, mid:MID});
  out.before = await status();
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const c=[...document.querySelectorAll('button')].filter(vis).find(e=>/Invite seam 2334/.test(e.textContent||''));
    c&&c.scrollIntoView({block:'center'}); c&&c.click();
  });
  await page.waitForTimeout(4000);
  out.buttonsBefore = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('button')].filter(vis)
      .filter(e=>/^(Yes|No)$/.test((e.textContent||'').trim()))
      .map(e=>({t:e.textContent.trim(), disabled:e.disabled, pressed:e.getAttribute('aria-pressed')}));
  });
  let resp=null;
  const h=async r=>{const rq=r.request();
    if(/\/respond$/.test(rq.url()) && rq.method()==='POST'){
      let b=null; try{b=await r.json()}catch{}
      resp={status:r.status(), body:JSON.stringify(b).slice(0,200), sent:(rq.postData()||'').slice(0,60)};}};
  page.on('response',h);
  // poll for a toast from BEFORE the click
  const toasts=[];
  const poll = setInterval(()=>{}, 1e9);
  await page.locator('button').filter({hasText:/^Yes$/}).first().click();
  for(let i=0;i<16;i++){
    toasts.push(await page.evaluate(()=>{
      const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
      return [...document.querySelectorAll('[role=status],[role=alert]')].filter(vis)
        .map(e=>(e.textContent||'').trim()).filter(Boolean);
    }));
    await page.waitForTimeout(300);
  }
  clearInterval(poll);
  page.off('response',h);
  out.respondCall = resp;
  out.anyToast = toasts.flat().filter(Boolean);
  out.buttonsAfter = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('button')].filter(vis)
      .filter(e=>/^(Yes|No)$/.test((e.textContent||'').trim()))
      .map(e=>({t:e.textContent.trim(), disabled:e.disabled, pressed:e.getAttribute('aria-pressed')}));
  });
  out.after = await status();
  return out;
};
