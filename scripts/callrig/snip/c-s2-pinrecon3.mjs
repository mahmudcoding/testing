export default async ({page}) => page.evaluate(()=>{
  const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
  const t=(b)=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim();
  const hits=[...document.querySelectorAll('button,a,[role="button"]')].filter(v)
      .filter(b=>/pin/i.test(t(b))).map(b=>({t:t(b).slice(0,40), y:Math.round(b.getBoundingClientRect().top)}));
  return {n:hits.length, hits:hits.slice(0,8)};
});
