export default async ({page}) => await page.evaluate(()=>{
  const els=[...document.querySelectorAll('audio,video')];
  return {n:els.length, els: els.map(e=>({tag:e.tagName.toLowerCase(), tid:e.getAttribute('data-testid'),
    vol:e.volume, muted:e.muted, paused:e.paused,
    tracks:(e.srcObject&&e.srcObject.getTracks?e.srcObject.getTracks().map(t=>t.kind+':'+(t.label||'').slice(0,18)):[])})).slice(0,12)};
});
