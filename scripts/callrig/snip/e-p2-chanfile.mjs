import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.evaluate(`(() => { const m=[...document.querySelectorAll('[data-message-id]')].pop(); m && m.scrollIntoView({block:'center'}); })()`);
  const probe = `(() => { ${VISFN}
    const m=[...document.querySelectorAll('[data-message-id]')].pop();
    if(!m) return 'nomsg';
    const img=m.querySelector('img');
    return 'h'+Math.round(m.getBoundingClientRect().height)
      +(img? ' img alt="'+(img.getAttribute('alt')||'')+'" nat'+img.naturalWidth+'x'+img.naturalHeight+' op'+getComputedStyle(img).opacity : ' NOIMG')
      +(/Unavailable/i.test(m.innerText||'') ? ' PLACEHOLDER' : ' no-placeholder'); })()`;
  const t=[]; for(let i=0;i<10;i++){ await page.waitForTimeout(700); t.push(await page.evaluate(probe)); }
  out.trace=[...new Set(t)].join('  ->  ');
  return out;
};
