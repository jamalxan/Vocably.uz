// Vocably Writing 27 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-27",
  "title": "Writing 27: Daily calorie supply per person",
  "difficulty": "hard",
  "dataset": "daily-per-capita-caloric-supply",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows the daily food supply per person, in kilocalories in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Daily calorie supply per person (kcal)",
        "unit": "kcal",
        "categories": [
          "2000",
          "2004",
          "2008",
          "2012",
          "2016",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "kcal",
        "series": [
          {
            "name": "United Kingdom",
            "data": [
              3369,
              3448,
              3397,
              3304,
              3345,
              3355
            ]
          },
          {
            "name": "China",
            "data": [
              2832,
              2875,
              2997,
              3103,
              3227,
              3330
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              2372,
              2363,
              2552,
              3101,
              3263,
              3242
            ]
          },
          {
            "name": "India",
            "data": [
              2345,
              2206,
              2360,
              2385,
              2473,
              2541
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "daily-per-capita-caloric-supply",
        "url": "https://ourworldindata.org/grapher/daily-per-capita-caloric-supply",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people think that employees should be paid according to the results they achieve, rather than the hours they work.</p><p>Do you agree or disagree?</p>"
    }
  }
};
