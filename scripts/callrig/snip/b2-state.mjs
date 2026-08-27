export default async ({page}) => {
  const s = await page.evaluate(() => {
    const vis = el => { if(!el) return false; let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*= parseFloat(c.opacity||'1'); n=n.parentElement; } return op>0.05; };
    const testids = [...document.querySelectorAll('[data-testid]')].filter(e=>vis(e)).map(e=>e.getAttribute('data-testid'));
    const main = document.querySelector('main');
    const dlg = [...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    const scope = dlg || main || document.body;
    const btns = [...scope.querySelectorAll('button,a[href],[role=tab],input')].filter(vis).map(b=>({t:(b.getAttribute('aria-label')||b.value||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,40), tid:b.getAttribute('data-testid')||undefined, dis:b.disabled||undefined})).filter(x=>x.t||x.tid);
    return {
      url: location.href,
      testids: [...new Set(testids)].filter(t=>/call|lobby|meet|join|waiting|ended|taken|recover/i.test(t)).slice(0,30),
      dialog: dlg ? (dlg.innerText||'').replace(/\n+/g,' | ').slice(0,300) : null,
      text: (scope.innerText||'').replace(/\n+/g,' | ').slice(0,500),
      btns: btns.slice(0,30),
      videos: document.querySelectorAll('video').length
    };
  });
  return s;
};
