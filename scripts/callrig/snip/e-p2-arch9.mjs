import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const reqs=[]; const h=r=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.request().method()+' '+u.replace(/https?:\/\/[^/]+/,'').slice(0,95)+' -> '+r.status());};
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.locator('button[aria-label="Open archived channels"]').click();
  await page.waitForTimeout(2000);
  const before = await page.evaluate(()=>({url:location.pathname, rows:[...document.querySelectorAll('button,a')].map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim()).filter(t=>/^Open$/.test(t)).length}));
  page.on('response',h);
  // click the FIRST exact-"Open" control (row order = e-arch-probe-2353 first)
  await page.evaluate(()=>{
    const c=[...document.querySelectorAll('button,a,[role=button]')]
      .filter(e=>((e.getAttribute('aria-label')||e.textContent||'').trim()==='Open'));
    c[0].click();
  });
  await page.waitForTimeout(4000);
  page.off('response',h);
  return await page.evaluate(({reqs,before})=>{
    const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
    const main=document.querySelector('main')||document.body;
    const msgs=[...document.querySelectorAll('[data-message-id]')];
    const comp=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    return {before, requests:reqs, url:location.pathname,
      messagesRendered: msgs.length,
      messageText: msgs.map(m=>m.innerText.replace(/\s+/g,' ').slice(0,70)),
      composerPresent: !!comp, composerEditable: comp?comp.getAttribute('contenteditable'):null,
      mainText: main.innerText.replace(/\s+/g,' ').slice(0,600),
      controls: [...main.querySelectorAll('button,a,[role=button],[contenteditable]')].filter(vis).map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,34)).slice(0,30)};
  },{reqs,before});
};
