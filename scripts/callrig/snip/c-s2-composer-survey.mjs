const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width<1||r.height<1) return false;
      let n=el, o=1; while(n && n!==document.documentElement){ const s=getComputedStyle(n); o*=parseFloat(s.opacity||'1'); if(s.display==='none'||s.visibility==='hidden') return false; n=n.parentElement; } return o>0.05; };
    const comp = document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    // walk up to composer container
    let box = comp; for (let i=0;i<6 && box;i++) box = box.parentElement;
    const ctrls = box ? [...box.querySelectorAll('button,[role="button"],input')].filter(vis).map(b=>({
      tag:b.tagName, label:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40),
      type:b.getAttribute('type'), pressed:b.getAttribute('aria-pressed'), disabled:b.disabled,
      testid:b.getAttribute('data-testid')
    })) : [];
    return {
      url: location.href,
      composerFound: !!comp,
      composerHTML: comp ? comp.innerHTML.slice(0,200) : null,
      placeholder: comp ? (comp.getAttribute('data-placeholder')||comp.parentElement.innerText.slice(0,80)) : null,
      controls: ctrls,
      lang: document.documentElement.lang
    };
  });
};
