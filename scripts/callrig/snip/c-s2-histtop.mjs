export default async ({page}) => page.evaluate(async ()=>{
  const sc=document.querySelector('[data-qa-scroller]');
  const ids=[...document.querySelectorAll('main [data-message-id]')]
    .map(e=>e.getAttribute('data-message-id'));
  const topId=ids[0];
  const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
  const marker=[...document.querySelectorAll('main *')].filter(v)
    .filter(e=>e.children.length===0)
    .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim())
    .filter(t=>/start of|beginning|Start this channel|created this channel/i.test(t));
  let seq=null;
  if(topId){
    const r=await fetch(`/api/v1/messaging/channels/C4QCGENERAL0001/messages?limit=100`,{credentials:'include'});
    const j=await r.json(); const m=(j&&j.messages)||[];
    const hit=m.find(x=>x.id===topId); seq=hit?hit.channel_seq:'not in newest page';
  }
  return {renderedCount:ids.length, topMessageId:topId?topId.slice(0,6)+'…':null,
    topMessageSeq:seq, beginningMarkers:marker.slice(0,3),
    scrollTop:sc?Math.round(sc.scrollTop):null};
});
