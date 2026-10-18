// Vocably Writing 8 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (problem) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-8",
  "title": "Writing 8: Share of the population living in urban areas",
  "difficulty": "medium",
  "dataset": "share-of-population-urban",
  "task2Type": "problem",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows the percentage of the population living in urban areas in the United States, Kazakhstan, France and Egypt between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Share of the population living in urban areas (%)",
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
              75.3,
              79.1,
              80.7,
              80
            ]
          },
          {
            "name": "Kazakhstan",
            "data": [
              57.2,
              56,
              54.2,
              60
            ]
          },
          {
            "name": "France",
            "data": [
              74.1,
              76.5,
              77.1,
              78.7
            ]
          },
          {
            "name": "Egypt",
            "data": [
              43.6,
              42.7,
              42.9,
              42.5
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "share-of-population-urban",
        "url": "https://ourworldindata.org/grapher/share-of-population-urban",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Many people today do not take enough physical exercise, and rates of obesity are rising.</p><p>What are the reasons for this, and what can be done to improve the situation?</p>"
    }
  }
};
