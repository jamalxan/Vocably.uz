// Vocably Writing 22 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (advdis) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-22",
  "title": "Writing 22: Share of the population with access to electricity",
  "difficulty": "medium",
  "dataset": "share-of-the-population-with-access-to-electricity",
  "task2Type": "advdis",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows the percentage of the population with access to electricity in the United States, France, Australia and the United Kingdom between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Share of the population with access to electricity (%)",
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
              100,
              100,
              100,
              100
            ]
          },
          {
            "name": "France",
            "data": [
              100,
              100,
              100,
              100
            ]
          },
          {
            "name": "Australia",
            "data": [
              100,
              100,
              100,
              100
            ]
          },
          {
            "name": "United Kingdom",
            "data": [
              100,
              100,
              100,
              100
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "share-of-the-population-with-access-to-electricity",
        "url": "https://ourworldindata.org/grapher/share-of-the-population-with-access-to-electricity",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>In many countries, people are now living longer than in the past.</p><p>Do the advantages of an ageing population outweigh the disadvantages?</p>"
    }
  }
};
