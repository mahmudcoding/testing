export default async ({ page }) => {
  return await page.evaluate(() => {
    const d=new Date('2026-08-27T02:38:00Z');
    const out={};
    for (const loc of ['en','ru','uz','uz-Cyrl','uz-Latn','uz-Latn-UZ']) {
      try {
        out[loc]={
          medium: new Intl.DateTimeFormat(loc,{dateStyle:'medium',timeStyle:'short'}).format(d),
          monthLong: new Intl.DateTimeFormat(loc,{month:'long'}).format(d),
          resolved: new Intl.DateTimeFormat(loc).resolvedOptions().locale
        };
      } catch(e) { out[loc]='ERR '+e.message; }
    }
    return out;
  });
};
