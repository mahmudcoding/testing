export default async ({page}) => {
  return await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    const hits = {};
    for (const k of keys) { const v = localStorage.getItem(k)||''; if (/push|ptt|talk/i.test(k+v)) hits[k]=v.slice(0,200); }
    return {localStorageHits: hits, keyCount: keys.length};
  });
};
