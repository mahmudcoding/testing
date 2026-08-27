export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OWBEYLQ71W43O'; // freshly created empty channel
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const out={};
  for(const [k,url] of [['plain-url','https://example.com'],['url-in-text','See https://www.wikipedia.org for details']]){
    await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
    await comp.type(url);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4000);
    out[k] = await page.evaluate(v=>{const vv=eval(v);
      const m=[...document.querySelectorAll('[data-message-id]')].pop();
      if(!m) return {none:true};
      return {id:m.getAttribute('data-message-id'), text:m.innerText.replace(/\s+/g,' ').slice(0,200),
        links:[...m.querySelectorAll('a')].filter(vv).map(a=>({href:(a.href||'').slice(0,60), t:a.innerText.trim().slice(0,40), target:a.target, rel:a.rel})),
        imgs:[...m.querySelectorAll('img')].filter(vv).length};}, V);
  }
  const api = await page.evaluate(async (c) => {
    const r=await fetch(`/api/v1/messaging/channels/${c}/messages?limit=3`,{credentials:'include'});
    const j=await r.json(); const arr=j.messages||j.data||j;
    return (Array.isArray(arr)?arr:[]).slice(0,2).map(m=>({body:m.body, preview:m.link_preview||m.preview||m.embeds||null}));
  }, ch);
  return {rendered: out, api};
};
