export default async ({page}) => {
  const out={};
  for (const [name,url] of [
    ['channel-general','https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001'],
    ['channel-private','https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBPRIVATE0001']]){
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
    out[name]= await page.evaluate(()=>{
      const vis = e => { const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
        return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'; };
      const hits=[...document.querySelectorAll('h3,p,button')]
        .filter(e=>vis(e)&&/Start this channel|Add teammates|Add users/i.test(e.innerText||'')&&(e.innerText||'').length<120)
        .map(e=>{const r=e.getBoundingClientRect();
          return {tag:e.tagName, text:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,60),
                  y:Math.round(r.y), inViewport: r.y>=0 && r.y<=innerHeight};});
      return {msgCount:document.querySelectorAll('[data-message-id]').length,
              members:((document.querySelector('main')?.innerText||'').match(/Members\s*(\d+)/)||[])[1]||null,
              hits, innerHeight};
    });
  }
  return out;
};
