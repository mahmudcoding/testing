import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  await page.goto(BASE+'/w/'+WS+'/c/C4QEPRIVATE0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.rawMessage = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/messaging/channels/C4QEPRIVATE0001/messages?limit=5',{credentials:'include'});
    const t=await r.text(); const j=JSON.parse(t); const a=j.messages||[];
    const m=a[a.length-1]; return JSON.stringify(m).slice(0,340); })()`);
  out.rendered = await page.evaluate(`(() => { ${VISFN}
    const m=[...document.querySelectorAll('[data-message-id]')].pop();
    const img=m.querySelector('img');
    return { msgHeight: Math.round(m.getBoundingClientRect().height),
      visibleLeaves:[...m.querySelectorAll('*')].filter(n=>n.children.length===0&&(n.textContent||'').trim()).filter(vis)
        .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,34)),
      img: img? {alt:img.getAttribute('alt'), nat:img.naturalWidth+'x'+img.naturalHeight,
        box:Math.round(img.getBoundingClientRect().width)+'x'+Math.round(img.getBoundingClientRect().height),
        selfOpacity:getComputedStyle(img).opacity} : 'no img element' }; })()`);
  return out;
};
