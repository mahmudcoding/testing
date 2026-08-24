export default async ({page}) => {
  const dom = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role="dialog"]')].pop();
    const plural = [...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /MESSAGES?\b/i.test(e.textContent||'')).map(e=>e.textContent.trim().slice(0,60));
    return {text: d? d.innerText.replace(/\n+/g,' | ').slice(0,900):'none', plural: [...new Set(plural)].slice(0,6),
      btns: d? [...d.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)}#${b.getAttribute('data-testid')||'-'}`):[]};
  });
  const api = await page.evaluate(async () => {
    const g = async p => { const r = await fetch(p,{credentials:'include'}); return r.status+' :: '+(await r.text()).slice(0,400); };
    return {
      chans: await g('/api/v1/workspaces/W4QAF1XTURESO01/channels'),
      hist: await g('/api/v1/meetings/history?limit=5'),
      cur: await g('/api/v1/meetings/current'),
      active: await g('/api/v1/workspace/W4QAF1XTURESO01/meetings/active')
    };
  });
  return {dom, api};
};
