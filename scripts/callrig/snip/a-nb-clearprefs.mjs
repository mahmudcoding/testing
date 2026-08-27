export default async ({page}) => {
  const before = await page.evaluate(()=>localStorage.getItem('aloqa-call-device-prefs'));
  await page.evaluate(()=>localStorage.removeItem('aloqa-call-device-prefs'));
  const after = await page.evaluate(()=>localStorage.getItem('aloqa-call-device-prefs'));
  return {before:(before||'').slice(0,120), after};
};
