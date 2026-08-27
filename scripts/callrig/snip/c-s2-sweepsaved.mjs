export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  for (const [name,path] of [['Saved Messages','chat/saved'],['Mentions','chat/mentions']]) {
    await page.goto(`https://airion-cargo.store/w/${ws}/${path}`);
    await page.waitForTimeout(10000);
    out[name]=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const main=document.querySelector('main')||document.body;
      const btns=[...main.querySelectorAll('button,a,input,[role="tab"]')].filter(v)
        .map(e=>`${e.tagName.toLowerCase()}:${(e.getAttribute('aria-label')||e.innerText||e.getAttribute('placeholder')||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,28)}`);
      return {controls:[...new Set(btns)].slice(0,22),
        items:main.querySelectorAll('[data-message-id]').length};});
  }
  return out;
};
