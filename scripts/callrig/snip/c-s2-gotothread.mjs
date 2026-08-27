export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  if(!page.url().includes('/chat/mentions')){
    await page.goto(`https://airion-cargo.store/w/${ws}/chat/mentions`); await page.waitForTimeout(6000); }
  // the entry marked THREAD REPLY: smallest element containing both the badge and a Go to message control
  const ok = await page.evaluate(()=>{
    let best=null;
    for (const el of document.querySelectorAll('main *')){
      const t=el.innerText||'';
      if(!/THREAD REPLY/.test(t) || !/Go to message/.test(t)) continue;
      const a=el.getBoundingClientRect().width*el.getBoundingClientRect().height;
      if(!best||a<best.a) best={el,a};
    }
    if(!best) return null;
    const badges=(best.el.innerText.match(/THREAD REPLY/g)||[]).length;
    const gos=(best.el.innerText.match(/Go to message/g)||[]).length;
    if(badges!==1||gos!==1) return {abort:{badges,gos}};
    const go=[...best.el.querySelectorAll('button,a')].find(b=>/Go to message/.test(b.textContent||''));
    if(!go) return {abort:'no control'};
    go.setAttribute('data-qa-go','1');
    return {rowText:best.el.innerText.replace(/\s+/g,' ').slice(0,80)};
  });
  out.row=ok;
  if(!ok||ok.abort) return out;
  out.before=page.url();
  await page.locator('[data-qa-go="1"]').click();
  await page.waitForTimeout(5000);
  out.after=page.url();
  out.threadPanel = await page.evaluate(()=>{
    const composers=[...document.querySelectorAll('div[contenteditable="true"]')].length;
    const m=document.querySelector('main');
    return {composers, hasThreadParam:location.search.includes('thread='),
      txt:(m?m.innerText:'').replace(/\s+/g,' ').slice(0,140)};
  });
  return out;
};
