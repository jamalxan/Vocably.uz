// Vocably Writing 37 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-37",
  "title": "Writing 37: Transport CO₂ emissions per person",
  "difficulty": "medium",
  "dataset": "per-capita-co2-transport",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows carbon dioxide emissions from transport per person, in tonnes in the United States, Kazakhstan, France and Egypt between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Transport CO₂ emissions per person (tonnes)",
        "unit": "tonnes",
        "categories": [
          "1990",
          "2000",
          "2010",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "tonnes",
        "series": [
          {
            "name": "United States",
            "data": [
              5631.89,
              6102.83,
              5400.1,
              4442.43
            ]
          },
          {
            "name": "Kazakhstan",
            "data": [
              840.62,
              605.12,
              781.03,
              1062
            ]
          },
          {
            "name": "France",
            "data": [
              1986.83,
              2227.16,
              1943.79,
              1622.48
            ]
          },
          {
            "name": "Egypt",
            "data": [
              276.56,
              400.23,
              502.71,
              488.86
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "per-capita-co2-transport",
        "url": "https://ourworldindata.org/grapher/per-capita-co2-transport",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people argue that international sporting events such as the Olympic Games bring great benefits to the host country. Others say they are too expensive.</p><p>Discuss both views and give your own opinion.</p>"
    }
  }
};
