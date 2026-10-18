// Vocably Writing 32 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (problem) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-32",
  "title": "Writing 32: Electricity generated per person",
  "difficulty": "medium",
  "dataset": "per-capita-electricity-generation",
  "task2Type": "problem",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows electricity generated per person, in kilowatt-hours in the United States, Kazakhstan, France and Egypt between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Electricity generated per person (kWh)",
        "unit": "kWh",
        "categories": [
          "1990",
          "2000",
          "2010",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "kWh",
        "series": [
          {
            "name": "United States",
            "data": [
              12759,
              13507,
              13225,
              11911
            ]
          },
          {
            "name": "Kazakhstan",
            "data": [
              5094,
              3331,
              4909,
              5576
            ]
          },
          {
            "name": "France",
            "data": [
              7300,
              8953,
              8868,
              8000
            ]
          },
          {
            "name": "Egypt",
            "data": [
              718,
              1003,
              1619,
              1817
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "per-capita-electricity-generation",
        "url": "https://ourworldindata.org/grapher/per-capita-electricity-generation",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Noise pollution is a serious problem in many large cities.</p><p>What are the main causes, and what measures could be taken to reduce it?</p>"
    }
  }
};
