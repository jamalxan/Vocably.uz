// Vocably Writing 24 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (two) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-24",
  "title": "Writing 24: Share of land covered by forest",
  "difficulty": "hard",
  "dataset": "forest-area-as-share-of-land-area",
  "task2Type": "two",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows the percentage of the land area covered by forest in the United States, Kazakhstan, France and Egypt between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Share of land covered by forest (%)",
        "unit": "%",
        "categories": [
          "1990",
          "2000",
          "2010",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "%",
        "series": [
          {
            "name": "United States",
            "data": [
              33.1,
              33.2,
              33.7,
              33.8
            ]
          },
          {
            "name": "Kazakhstan",
            "data": [
              1.2,
              1.2,
              1.1,
              1.3
            ]
          },
          {
            "name": "France",
            "data": [
              26.8,
              28.4,
              30.5,
              32.2
            ]
          },
          {
            "name": "Egypt",
            "data": [
              0,
              0,
              0,
              0
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "forest-area-as-share-of-land-area",
        "url": "https://ourworldindata.org/grapher/forest-area-as-share-of-land-area",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Many people now buy their goods online rather than in local shops.</p><p>What are the reasons for this, and what effect might it have on town centres?</p>"
    }
  }
};
