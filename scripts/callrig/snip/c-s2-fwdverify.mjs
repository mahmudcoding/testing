export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dst='C4QCGENERAL0001', src='C4QCPRIVATE0001';
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${dst}`);
  const s=[];
  for(let i=0;i<16;i++){ await page.waitForTimeout(700);
    s.push(await page.evaluate(()=>{
      const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
        .find(x=>/QA-S2-FWDATT/.test(x.innerText||''));
      if(!e) return {present:false};
      return {present:true, imgs:e.querySelectorAll('img').length,
        fileBtns:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
          .filter(l=>l&&/Preview|Download|Open q/.test(l)).length,
        text:(e.innerText||'').replace(/\s+/g,' ').slice(0,90)};}));
  }
  out.settled=s.at(-1);
  out.everImgs=s.some(x=>x.imgs>0);
  out.everFileBtn=s.some(x=>x.fileBtns>0);
  // API view of both messages
  out.api = await page.evaluate(async({src,dst})=>{
    const g=async(ch,re)=>{
      const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=30`,{credentials:'include'})).json();
      const ms=j.messages||j.data||j||[];
      const m=ms.find(x=>re.test(x.body||''));
      return m? {id:m.id, body:(m.body||'').slice(0,40),
        fileKeys:Object.keys(m).filter(k=>/file|attach|media/i.test(k)),
        files:m.files??m.attachments??null,
        forwarded_from:m.forwarded_from? 'set':null}:'absent';};
    return {source: await g(src,/FWDATT source/), forwarded: await g(dst,/FWDATT source/)};
  }, {src,dst});
  return out;
};
