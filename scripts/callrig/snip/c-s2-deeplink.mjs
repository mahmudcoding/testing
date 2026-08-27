export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const targets=[['channel I am not in','c/C4QCEMPTY000001'],
                 ['nonexistent channel','c/C4QCNOSUCHXXXXX']];
  const out=[];
  for (const [name,path] of targets) {
    await page.goto(`https://airion-cargo.store/w/${ws}/${path}`);
    await page.waitForTimeout(9000);
    out.push(await page.evaluate((name)=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const vis=(e)=>{let op=1,n=e;while(n&&n!==document.documentElement){
        const s=getComputedStyle(n);op*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden')return 0;n=n.parentElement;}return +op.toFixed(2);};
      const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
      const main=document.querySelector('main');
      return {name,
        composer: c?{visible:v(c),opacity:vis(c),
                     editable:c.getAttribute('contenteditable'),
                     ariaDisabled:c.getAttribute('aria-disabled')}:null,
        messages: document.querySelectorAll('main [data-message-id]').length,
        mainText: main?(main.innerText||'').replace(/\s+/g,' ').trim().slice(0,120):'NO-MAIN'};
    },name));
  }
  return out;
};
