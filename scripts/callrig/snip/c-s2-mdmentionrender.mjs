export default async ({page}) => page.evaluate(()=>{
  const res=[];
  for (const el of document.querySelectorAll('main [data-message-id]')){
    const t=el.innerText||'';
    if(!/QA-S2-MDMANUAL|QA-S2-MANUAL-2|QA-S2-PICKED-2/.test(t)) continue;
    const b=el.querySelector('button[data-mention-user-id]');
    res.push({tag:/MDMANUAL/.test(t)?'MD-TYPED':(/MANUAL-2/.test(t)?'PLAIN-TYPED':'PLAIN-PICKED'),
      isChip:!!b, label:b&&b.textContent.trim(), userId:b&&b.dataset.mentionUserId,
      text:t.replace(/\s+/g,' ').slice(0,70)});
  }
  return res;
});
