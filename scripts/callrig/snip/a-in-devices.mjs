export default async ({page}) => {
  const dev = await page.evaluate(async () => {
    const ds = await navigator.mediaDevices.enumerateDevices();
    return ds.map(d=>d.kind+' | '+d.deviceId.slice(0,10)+' | '+d.label);
  });
  const toolbar = await page.evaluate(()=>{
    const root = document.querySelector('[data-testid="call-overlay-expanded"]') || document.body;
    return [...root.querySelectorAll('button')].filter(b=>b.getClientRects().length)
      .map(b=>(b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,26))+(b.disabled?' [disabled]':'')+(b.getAttribute('data-testid')?' {'+b.getAttribute('data-testid')+'}':''))
      .filter(Boolean).slice(0,40);
  });
  return {dev, toolbar};
};
