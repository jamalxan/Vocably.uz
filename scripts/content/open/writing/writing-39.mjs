// Vocably Writing 39 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-39",
  "title": "Writing 39: Vegetable supply per person",
  "difficulty": "hard",
  "dataset": "vegetable-consumption-per-capita",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows the amount of vegetables available per person, in kilograms per year in the United States, France, Egypt and Indonesia between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Vegetable supply per person (kg per year)",
        "unit": "kg per year",
        "categories": [
          "1990",
          "2000",
          "2010",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "kg per year",
        "series": [
          {
            "name": "United States",
            "data": [
              117.3,
              133.8,
              132.9,
              121.6
            ]
          },
          {
            "name": "France",
            "data": [
              126.2,
              108.9,
              108.9,
              108.7
            ]
          },
          {
            "name": "Egypt",
            "data": [
              140.5,
              183,
              192,
              130.6
            ]
          },
          {
            "name": "Indonesia",
            "data": [
              22.8,
              30.6,
              39.1,
              49.5
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "vegetable-consumption-per-capita",
        "url": "https://ourworldindata.org/grapher/vegetable-consumption-per-capita",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people believe that everyone should learn how to use computers and programming from a young age.</p><p>To what extent do you agree or disagree?</p>"
    }
  }
};
