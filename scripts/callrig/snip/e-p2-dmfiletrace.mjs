import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const DM='C4OWQV2ZT4AAI6R';
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  await page.goto(BASE+'/w/'+WS+'/d/'+DM, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.evaluate(`(() => { const m=[...document.querySelectorAll('[data-message-id]')].pop(); m && m.scrollIntoView({block:'center'}); })()`);
  const probe = `(() => { ${VISFN}
    const m=[...document.querySelectorAll('[data-message-id]')].pop();
    if(!m) return 'nomsg';
    const img=m.querySelector('img');
    return 'h'+Math.round(m.getBoundingClientRect().height)
      +(img? ' img nat'+img.naturalWidth+'x'+img.naturalHeight+' op'+getComputedStyle(img).opacity : ' noimg')
      +(/Unavailable/i.test(m.innerText||'') ? ' PLACEHOLDER' : ' no-placeholder'); })()`;
  const t=[]; for(let i=0;i<16;i++){ await page.waitForTimeout(800); t.push(await page.evaluate(probe)); }
  out.trace=[...new Set(t)].join('  ->  ');
  out.lastMessagePayload = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/messaging/channels/${DM}/messages?limit=10',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.messages||[];
    return a.map(m=>String(m.id).slice(0,12)+':'+JSON.stringify(m.files||[]).slice(0,90)).slice(-2); })()`);
  return out;
};
