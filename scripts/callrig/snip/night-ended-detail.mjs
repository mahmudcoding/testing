export default async ({page}) => {
  return await page.evaluate(()=>{
    const g=(t)=>{const e=document.querySelector('[data-testid="'+t+'"]'); return e?{text:e.innerText.replace(/\n+/g,' | ').slice(0,700), buttons:[...e.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40),t:b.getAttribute('data-testid'),d:b.disabled}))}:null;};
    return {
      overlay: (o=>o?o.innerText.replace(/\n+/g,' | ').slice(0,300):null)(document.querySelector('[data-testid="call-ended-overlay"]')),
      summary: g('call-ended-summary'),
      stats: g('call-ended-stats'),
      participants: g('ended-participants-list'),
      aiSummary: g('ended-ai-summary'),
      transcript: g('call-ended-transcript'),
      rate: g('ended-rate-section')
    };
  });
};
