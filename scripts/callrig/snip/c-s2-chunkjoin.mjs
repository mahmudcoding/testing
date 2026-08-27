export default async ({page}) => page.evaluate(()=>{
  const parts=[];
  for (const el of document.querySelectorAll('main [data-message-id]')){
    const t=el.innerText||''; if(!/QA-S2-CH-/.test(t)) continue;
    // strip the author/time header line the message row adds
    const body=t.split('\n').filter(l=>/QA-S2-CH-|^x+$/.test(l)).join('');
    parts.push(body);
  }
  const joined=parts.join('');
  const found=(joined.match(/QA-S2-CH-\d{3}/g)||[]);
  const missing=[];
  for(let i=0;i<40;i++){ const m='QA-S2-CH-'+String(i).padStart(3,'0'); if(!joined.includes(m)) missing.push(m); }
  return {messages:parts.length, joinedLen:joined.length, markersFound:found.length,
    missing, firstFew:found.slice(0,3), lastFew:found.slice(-3),
    ordered: found.every((m,i)=> i===0 || m>found[i-1])};
});
