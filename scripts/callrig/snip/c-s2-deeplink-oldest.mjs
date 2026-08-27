const WS='W4QCF1XTURESO01', CH='C4OWKU9EANT1XSR';
export default async ({page}) => {
  const out={};
  out.oldest = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=5&before_seq=6`,{credentials:'include'});
    const j=await r.json(); const l=j.messages||[];
    return {list:l.map(m=>({b:(m.body||'').slice(0,18), seq:m.channel_seq, id:m.id}))};
  }, CH);
  const target = out.oldest.list[out.oldest.list.length-1];
  out.target = target;
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}?m=${target.id}`,{waitUntil:'load'});
  await page.waitForTimeout(10000);
  out.after = await page.evaluate((wantId)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const st=[...document.querySelectorAll('[role="status"]')].filter(vis)
      .map(e=>({t:(e.textContent||'').trim().slice(0,90), pos:getComputedStyle(e).position,
        btns:[...e.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||'').trim())}));
    const t=document.querySelector(`[data-message-id="${wantId}"]`);
    const nums=[...document.querySelectorAll('[data-message-id]')].map(e=>{const m=(e.innerText||'').match(/QA-S2-PAGE-(\d+)/); return m?Number(m[1]):null;}).filter(Boolean);
    return {n:document.querySelectorAll('[data-message-id]').length,
      minNum: nums.length?Math.min(...nums):null, maxNum: nums.length?Math.max(...nums):null,
      targetPresent: !!t, targetY: t? Math.round(t.getBoundingClientRect().y):null,
      statuses:st, hasOlderNotice:/older|Dismiss/i.test(document.body.innerText)};
  }, target.id);
  return out;
};
