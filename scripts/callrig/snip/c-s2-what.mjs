export default async ({page}) => {
  return await page.evaluate(() => {
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const ds=[...document.querySelectorAll('[role="dialog"]')];
    return {url:location.href,
      dialogs: ds.map(d=>({vis:vis(d), text:d.innerText.replace(/\n+/g,' | ').slice(0,200),
        buttons:[...d.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,25))})),
      backdrops: [...document.querySelectorAll('.aloqa-modal-backdrop')].map(b=>({state:b.getAttribute('data-state'), vis:vis(b),
        rect: (r=>({w:Math.round(r.width),h:Math.round(r.height)}))(b.getBoundingClientRect())})),
      bodyStart: document.body.innerText.replace(/\n+/g,' | ').slice(0,300)};
  });
};
