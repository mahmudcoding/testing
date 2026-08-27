export default async ({page}) => page.evaluate(()=>{
  const res=[];
  for (const el of document.querySelectorAll('main [data-message-id]')) {
    const t=el.innerText||''; if(!/QA-S2-(MANUAL|PICKED)-1/.test(t)) continue;
    const b=el.querySelector('button[data-mention-user-id]');
    res.push({tag:/MANUAL/.test(t)?'MANUAL':'PICKED',
      handle:b&&b.dataset.mentionHandle, userId:b&&b.dataset.mentionUserId,
      label:b&&b.textContent.trim()});
  }
  return res;
});
