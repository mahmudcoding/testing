export default async ({page}) => {
  const out={};
  const ws=page.url().split('/w/')[1].split('/')[0];
  out.ws=ws;
  out.newest = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/notifications?limit=25',{credentials:'include'})).json();
    const arr=j.notifications||j.data||j||[];
    return arr.slice(0,6).map(n=>({type:n.type,title:n.title,
      body:(n.body||n.message||'').replace(/\s+/g,' ').slice(0,50), at:n.created_at}));
  });
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/mentions`);
  // poll until settled instead of a fixed wait
  const samples=[];
  for (let i=0;i<20;i++){
    await page.waitForTimeout(600);
    samples.push(await page.evaluate(()=>document.querySelectorAll('main [data-message-id]').length));
    if (samples.length>3 && samples.at(-1)>0 && samples.at(-1)===samples.at(-2) && samples.at(-2)===samples.at(-3)) break;
  }
  out.settle=samples;
  out.mentions = await page.evaluate(()=>[...document.querySelectorAll('main [data-message-id]')]
    .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,66)));
  return out;
};
