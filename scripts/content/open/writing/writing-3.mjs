// Vocably Writing 3 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (advdis) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-3",
  "title": "Writing 3: CO₂ emissions per person",
  "difficulty": "hard",
  "dataset": "co-emissions-per-capita",
  "task2Type": "advdis",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows carbon dioxide emissions per person, in tonnes in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "CO₂ emissions per person (tonnes)",
        "unit": "tonnes",
        "categories": [
          "2000",
          "2004",
          "2008",
          "2012",
          "2016",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "tonnes",
        "series": [
          {
            "name": "United Kingdom",
            "data": [
              9.6,
              9.5,
              8.8,
              7.6,
              6.1,
              4.8
            ]
          },
          {
            "name": "China",
            "data": [
              2.9,
              4,
              5.6,
              7.1,
              6.9,
              7.6
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              5,
              5,
              4.7,
              4.1,
              3.5,
              3.2
            ]
          },
          {
            "name": "India",
            "data": [
              0.9,
              1,
              1.2,
              1.5,
              1.8,
              1.7
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
      "promptHtml": "<p>More and more people are choosing to work from home instead of going to an office.</p><p>Do the advantages of this trend outweigh the disadvantages?</p>"
    }
  }
};
