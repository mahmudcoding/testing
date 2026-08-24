export default async ({page}) => await page.evaluate(() => {
  const hits = [];
  document.querySelectorAll('*').forEach(e => {
    if (e.children.length===0 && /^\d+%$/.test((e.textContent||'').trim())) {
      let p = e, chain=[];
      for (let i=0;i<5 && p;i++){ chain.push(`${p.tagName}${p.getAttribute('data-testid')?'#'+p.getAttribute('data-testid'):''}${p.getAttribute('aria-label')?'[':''}${p.getAttribute('aria-label')||''}${p.getAttribute('aria-label')?']':''}`); p=p.parentElement; }
      hits.push({txt:e.textContent.trim(), chain: chain.join(' < '), ctx: (e.closest('div')?.parentElement?.innerText||'').replace(/\n+/g,' | ').slice(0,160)});
    }
  });
  const sliders = [...document.querySelectorAll('[role="slider"],input[type=range]')].map(s=>`${s.getAttribute('aria-label')||''}|now=${s.getAttribute('aria-valuenow')||s.value}|${s.getAttribute('data-testid')||''}`);
  const audios = [...document.querySelectorAll('audio')].map(a=>({muted:a.muted, vol:a.volume, paused:a.paused, src:!!a.srcObject, tid:a.getAttribute('data-testid')||''}));
  return {hits, sliders, audios};
});
