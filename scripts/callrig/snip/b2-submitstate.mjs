export default async ({page}) => {
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const b=document.querySelector('[data-testid="calls-start-submit"]');
    const inp=[...document.querySelectorAll('[role=dialog] input[type=text],[role=dialog] input:not([type])')][0];
    const err=document.querySelector('[data-testid="calls-start-submit-error"]');
    // any validation text near the name field
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(v).pop();
    const smalls=dlg?[...dlg.querySelectorAll('p,span,div')].filter(e=>v(e) && (e.innerText||'').trim().length<120 && /symbol|character|长|макс|длин|too long|limit|символ/i.test(e.innerText||'')).map(e=>e.innerText.trim()).slice(0,4):[];
    return {
      submit: b?{disabled:b.disabled, vis:v(b), opacity:getComputedStyle(b).opacity, cursor:getComputedStyle(b).cursor, aria:b.getAttribute('aria-disabled')}:null,
      nameLen: inp?inp.value.length:null,
      nameMaxLength: inp?inp.maxLength:null,
      nameValid: inp?inp.checkValidity():null,
      errShown: err?(err.innerText||'').trim():null,
      validationTexts: smalls
    };
  });
};
