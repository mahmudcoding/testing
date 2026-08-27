export default async ({page}) => {
  return await page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); if (!r.width||!r.height) return false;
      let n=el, op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };
    const main = document.querySelector('main');
    const all=[...document.querySelectorAll('button,a,[role=button],[role=tab]')].filter(e=>vis(e)&&(!main||!main.contains(e)));
    return {list: all.map(e=>`${Math.round(e.getBoundingClientRect().left)},${Math.round(e.getBoundingClientRect().top)} ${e.tagName[0]} "${(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,45)}"`),
      sidebarText: (document.querySelector('nav')?.innerText||'').replace(/\n+/g,' | ').slice(0,500)};
  });
};
