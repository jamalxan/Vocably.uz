// Vocably Writing 28 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (advdis) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-28",
  "title": "Writing 28: Daily calorie supply per person",
  "difficulty": "medium",
  "dataset": "daily-per-capita-caloric-supply",
  "task2Type": "advdis",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows the daily food supply per person, in kilocalories in the United States, France, Egypt and Indonesia between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Daily calorie supply per person (kcal)",
        "unit": "kcal",
        "categories": [
          "1990",
          "2000",
          "2010",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "kcal",
        "series": [
          {
            "name": "United States",
            "data": [
              3509,
              3796,
              3731,
              3847
            ]
          },
          {
            "name": "France",
            "data": [
              3497,
              3589,
              3504,
              3485
            ]
          },
          {
            "name": "Egypt",
            "data": [
              3069,
              3048,
              3295,
              3112
            ]
          },
          {
            "name": "Indonesia",
            "data": [
              2276,
              2356,
              2608,
              2880
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
      "promptHtml": "<p>More students are choosing to study abroad rather than at universities in their own country.</p><p>Do the advantages of studying abroad outweigh the disadvantages?</p>"
    }
  }
};
