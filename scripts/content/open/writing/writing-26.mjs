// Vocably Writing 26 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (problem) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-26",
  "title": "Writing 26: Energy use per person",
  "difficulty": "medium",
  "dataset": "per-capita-energy-use",
  "task2Type": "problem",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows primary energy use per person, in kilowatt-hours in the United States, Kazakhstan, France and Egypt between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Energy use per person (kWh)",
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
              87859,
              93272,
              82758,
              70530
            ]
          },
          {
            "name": "Kazakhstan",
            "data": [
              49260,
              22902,
              35455,
              36779
            ]
          },
          {
            "name": "France",
            "data": [
              45703,
              51569,
              47740,
              36958
            ]
          },
          {
            "name": "Egypt",
            "data": [
              6368,
              7397,
              9740,
              8674
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "per-capita-energy-use",
        "url": "https://ourworldindata.org/grapher/per-capita-energy-use",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Plastic waste is damaging the oceans and wildlife all over the world.</p><p>What are the main causes of this problem, and what can governments and individuals do to reduce it?</p>"
    }
  }
};
