export default async ({page}) => {
  const M = process.env.QA_MEET;
  const api = await page.evaluate(async (M) => {
    const j = async p => { const r=await fetch(p,{credentials:'include'}); return r.status+' :: '+(await r.text()).slice(0,300); };
    return {recordings: await j('/api/v1/meeting/'+M+'/recordings')};
  }, M);
  const ui = await page.evaluate(() => ({
    badge: !!document.querySelector('[data-testid="call-recording-badge"]'),
    badgeText: (document.querySelector('[data-testid="call-recording-badge"]')||{}).innerText,
    toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,140)).filter(Boolean),
    toolbar: [...(document.querySelector('[data-testid="call-toolbar"]')||document.body).querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||'').slice(0,28)).filter(Boolean)
  }));
  return {api, ui};
};
