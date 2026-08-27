export default async ({page}) => {
  const out={};
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='Participants'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  out.waiting = await page.evaluate(()=>{
    const t=document.body.innerText.replace(/\s+/g,' ');
    return (t.match(/WAITING.{0,180}/i)||[])[0]||null;
  });
  out.admitBtns = await page.evaluate(()=>[...document.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(a=>a&&/admit|deny/i.test(a)).slice(0,6));
  // measure clipping on leaf nodes inside the waiting area
  out.clip = await page.evaluate(()=>{
    const res=[];
    document.querySelectorAll('*').forEach(el=>{
      if (el.children.length) return;
      const txt=(el.innerText||'').trim();
      if (!txt.includes('XXXX')) return;
      const r=el.getBoundingClientRect();
      res.push({tag:el.tagName, len:txt.length, scrollW:el.scrollWidth, clientW:el.clientWidth, clipped: el.scrollWidth>el.clientWidth, w:Math.round(r.width), h:Math.round(r.height), right:Math.round(r.right), innerW:innerWidth, overflowsViewport: r.right>innerWidth});
    });
    return res.slice(0,6);
  });
  out.docScroll = await page.evaluate(()=>({docScrollW:document.documentElement.scrollWidth, innerW:innerWidth}));
  return out;
};
