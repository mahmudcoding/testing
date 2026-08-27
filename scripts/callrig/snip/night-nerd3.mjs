export default async ({page}) => {
  return await page.evaluate(()=>{
    const cands=[...document.querySelectorAll('[data-testid]')].filter(e=>{
      const t=e.innerText||'';
      return /kbps|kb\/s|bitrate|packet|jitter|rtt|codec|resolution|fps/i.test(t) && t.length<1200;
    }).map(e=>({t:e.getAttribute('data-testid'), len:(e.innerText||'').length, text:e.innerText.replace(/\n+/g,' | ').slice(0,600)}));
    cands.sort((a,b)=>a.len-b.len);
    return {matches: cands.slice(0,3), anyStatsWord: /kbps|jitter|rtt/i.test(document.body.innerText)};
  });
};
