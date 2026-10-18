// Vocably Writing 4 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (problem) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-4",
  "title": "Writing 4: CO₂ emissions per person",
  "difficulty": "medium",
  "dataset": "co-emissions-per-capita",
  "task2Type": "problem",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows carbon dioxide emissions per person, in tonnes in the United States, Kazakhstan, France and Egypt between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "CO₂ emissions per person (tonnes)",
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
              20.3,
              21.4,
              18.2,
              13.8
            ]
          },
          {
            "name": "Kazakhstan",
            "data": [
              15.6,
              9.2,
              14.7,
              14.5
            ]
          },
          {
            "name": "France",
            "data": [
              6.9,
              6.8,
              5.9,
              4.3
            ]
          },
          {
            "name": "Egypt",
            "data": [
              1.2,
              2,
              2.3,
              2.3
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "co-emissions-per-capita",
        "url": "https://ourworldindata.org/grapher/co-emissions-per-capita",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>In many cities, traffic congestion is getting worse every year.</p><p>What are the causes of this problem, and what measures could be taken to solve it?</p>"
    }
  }
};
