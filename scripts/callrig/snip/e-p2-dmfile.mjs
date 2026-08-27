import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const DM='C4OWQV2ZT4AAI6R';
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  await page.goto(BASE+'/w/'+WS+'/d/'+DM, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.evaluate(`(() => { const m=[...document.querySelectorAll('[data-message-id]')].pop(); m && m.scrollIntoView({block:'center'}); })()`);
  await page.waitForTimeout(1500);
  out.rendered = await page.evaluate(`(() => { ${VISFN}
    const m=[...document.querySelectorAll('[data-message-id]')].pop();
    if(!m) return 'no message';
    const img=m.querySelector('img');
    return {height:Math.round(m.getBoundingClientRect().height),
      visibleLeaves:[...m.querySelectorAll('*')].filter(n=>n.children.length===0&&(n.textContent||'').trim()).filter(vis)
        .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,30)),
      img: img? {alt:img.getAttribute('alt'), nat:img.naturalWidth+'x'+img.naturalHeight, op:getComputedStyle(img).opacity} : 'no img element',
      hasUnavailable: /Unavailable|unavailable/.test(m.innerText||'')}; })()`);
  out.payload = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/messaging/channels/${DM}/messages?limit=5',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.messages||[];
    const m=a[a.length-1]; return m? JSON.stringify(m.files||[]).slice(0,180) : 'none'; })()`);
  return out;
};
