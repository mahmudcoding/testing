export default async ({page}) => await page.evaluate(()=>{
  const t=document.querySelector('[data-testid="call-top-bar"]');
  return {topBar: t?t.innerText.replace(/\n+/g,' | ').slice(0,200):null,
    settingsName: (i=>i?i.value:null)(document.querySelector('[data-testid="meeting-settings-name-input"]'))};
});
