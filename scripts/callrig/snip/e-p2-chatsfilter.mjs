import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const trigger = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('button')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim())
      .filter(t=>/^All chats|CHATS/i.test(t)).slice(0,3);
  });
  if(!trigger.length) return {noChatsFilter:true};
  await page.locator('button').filter({hasText:/^All chats$/}).first().click();
  await page.waitForTimeout(2500);
  const opts = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    return [...new Set([...document.querySelectorAll('button,[role=option],[role=menuitem],li')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim())
      .filter(t=>t && t.length<40 && /^(#|All chats|qa-|e-)/.test(t)))].slice(0,12);
  });
  return {trigger, options:opts,
    listsArchived: opts.some(o=>/qa-archived|e-arch-probe/.test(o)),
    listsLive: opts.some(o=>/qa-general|e-search-control/.test(o))};
};
