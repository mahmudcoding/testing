export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  return page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=6`,{credentials:'include'});
    const j=await r.json();
    return (j.messages||[]).map(m=>{
      const e=document.querySelector(`main [data-message-id="${m.id}"]`);
      return {seq:m.channel_seq, body:(m.body||'').slice(0,26),
        files:(m.files||m.attachments||[]).length,
        imgs:e?e.querySelectorAll('img').length:null,
        videos:e?e.querySelectorAll('video').length:null,
        btns:e?[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
          .filter(b=>b&&/Open|Preview|Download|Play/.test(b)).slice(0,3):null};});}, ch);
};
