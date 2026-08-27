// Finding 4: link preview card content + whether the server sends any preview payload.
export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const ch = process.env.CH || 'C4QCGENERAL0001';
  const URL_ = process.env.LINK || 'https://developer.mozilla.org/en-US/docs/Web/CSS';
  const V=`(e=>{const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1;
    while(n){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05;})`;

  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  await comp.type(URL_); await page.keyboard.press('Enter');
  await page.waitForTimeout(6000);

  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(5000);

  const dom = await page.evaluate(v=>{const vv=eval(v);
    const m=[...document.querySelectorAll('[data-message-id]')].pop();
    const leaves=[...m.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&vv(e))
      .map(e=>({tag:e.tagName, t:e.textContent.trim().slice(0,60), y:Math.round(e.getBoundingClientRect().top)}));
    const a=m.querySelector('a[href]');
    const img=[...m.querySelectorAll('img')].filter(vv).map(i=>({src:(i.src||'').slice(0,60), w:i.naturalWidth,h:i.naturalHeight}));
    return {id:m.getAttribute('data-message-id'), leaves, msgHeight:Math.round(m.getBoundingClientRect().height),
      anchor:a?{href:a.href.slice(0,80), target:a.target, rel:a.rel}:null, images:img};
  }, V);

  const api = await page.evaluate(async (args)=>{
    const r=await fetch(`/api/v1/messaging/channels/${args.ch}/messages?limit=3`,{credentials:'include'});
    const j=await r.json(); const arr=j.messages||j.data||j;
    const msg=(Array.isArray(arr)?arr:[]).find(x=>x.id===args.id) || (Array.isArray(arr)?arr[0]:null);
    return msg?{keys:Object.keys(msg), hasPreview:['link_preview','preview','embeds','attachments','metadata','unfurls'].filter(k=>msg[k]!==undefined&&msg[k]!==null&&(!Array.isArray(msg[k])||msg[k].length)), body:String(msg.body||'').slice(0,90)}:{noMsg:true};
  }, {ch, id:dom.id});
  return {dom, serverMessage:api};
};
