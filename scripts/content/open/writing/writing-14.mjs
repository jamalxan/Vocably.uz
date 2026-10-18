// Vocably Writing 14 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (problem) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-14",
  "title": "Writing 14: Children per woman",
  "difficulty": "medium",
  "dataset": "children-per-woman-un",
  "task2Type": "problem",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows the average number of children born per woman in the United States, Kazakhstan, France and Egypt between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Children per woman (fertility rate)",
        "unit": "children per woman",
        "categories": [
          "1990",
          "2000",
          "2010",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "children per woman",
        "series": [
          {
            "name": "United States",
            "data": [
              2.07,
              2.03,
              1.92,
              1.62
            ]
          },
          {
            "name": "Kazakhstan",
            "data": [
              2.75,
              1.9,
              2.61,
              3.13
            ]
          },
          {
            "name": "France",
            "data": [
              1.78,
              1.88,
              2.02,
              1.78
            ]
          },
          {
            "name": "Egypt",
            "data": [
              4.51,
              3.5,
              3.3,
              2.85
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "children-per-woman-un",
        "url": "https://ourworldindata.org/grapher/children-per-woman-un",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Many young people find it difficult to find a job after finishing their studies.</p><p>What are the causes of youth unemployment, and what can be done about it?</p>"
    }
  }
};
