export default async ({page}) => {
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const mic=[...document.querySelectorAll('button')].filter(v).find(b=>/^(Mute|Unmute)$/.test(b.getAttribute('aria-label')||''));
    const doc=(document.body.innerText||'');
    const explain=[...document.querySelectorAll('*')].filter(e=>v(e) && /blocked|not allowed|disabled by|host has|cannot use|turned off by/i.test((e.innerText||'')) && (e.innerText||'').length<160)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).slice(0,6);
    return {
      mic: mic?{al:mic.getAttribute('aria-label'), disabled:mic.disabled, ariaDisabled:mic.getAttribute('aria-disabled'),
                title:mic.getAttribute('title'), pressed:mic.getAttribute('aria-pressed'),
                opacity:getComputedStyle(mic).opacity, cursor:getComputedStyle(mic).cursor}:null,
      explanations:[...new Set(explain)],
      docMentionsMic: /microphone/i.test(doc)
    };
  });
};
