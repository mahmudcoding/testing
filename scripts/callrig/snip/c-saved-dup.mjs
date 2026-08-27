export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const dom = await page.evaluate(() => {
    const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
      let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
    return [...document.querySelectorAll('[data-message-id]')].map(m=>{
      // leaf text nodes that are visible
      const leaves=[...m.querySelectorAll('*')].filter(e=>e.children.length===0 && e.textContent.trim() && vis(e))
        .map(e=>({tag:e.tagName, cls:(e.className||'').toString().slice(0,30), t:e.textContent.trim().slice(0,60), y:Math.round(e.getBoundingClientRect().top)}));
      return {id:m.getAttribute('data-message-id'), leaves};
    });
  });
  const api = await page.evaluate(async () => {
    const r = await fetch('/api/v1/workspaces/W4QCF1XTURESO01/channels',{credentials:'include'});
    const j = await r.json(); const arr=j.channels||j.data||j;
    const saved=(Array.isArray(arr)?arr:[]).filter(c=>/saved/i.test(c.name||'')||c.type==='saved'||c.is_saved);
    return saved.map(c=>({id:c.id,name:c.name,type:c.type}));
  });
  return {dom, savedChannels: api};
};
