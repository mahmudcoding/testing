export default async ({page}) => {
  return await page.evaluate(()=>{
    const main=document.querySelector('main')||document.body;
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const pip=document.querySelector('[data-testid="pip-mini-call"],[data-testid="draggable-pip"]');
    const pipRect=pip?pip.getBoundingClientRect():null;
    // visible content excluding the PiP widget
    const nodes=[...main.querySelectorAll('*')].filter(e=>vis(e)&&!(pip&&pip.contains(e)));
    return {url:location.pathname,
      pipSize: pipRect?Math.round(pipRect.width)+'x'+Math.round(pipRect.height):null,
      bodyTextLen:(document.body.innerText||'').trim().length,
      mainTextSample:(main.innerText||'').replace(/\s+/g,' ').slice(0,140),
      visibleNodesOutsidePip: nodes.length,
      buttonsOutsidePip:[...main.querySelectorAll('button')].filter(b=>vis(b)&&!(pip&&pip.contains(b)))
        .map(b=>(b.getAttribute('aria-label')||(b.textContent||'').trim()).slice(0,22)).slice(0,10)};
  });
};
