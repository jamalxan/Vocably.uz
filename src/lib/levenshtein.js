// Ikki qator orasidagi tahrirlash masofasi — TestMode (shakli o'xshash distraktorlar,
// 6.1.2) va WritingTest (qisman kredit — "1 harf xato" aniqlash, 6.1.3) ikkalasida
// ham ishlatiladi, shuning uchun bitta umumiy joyda.
export function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}
