// Vocably Writing 16 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (advdis) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-16",
  "title": "Writing 16: Child deaths before age five",
  "difficulty": "medium",
  "dataset": "child-mortality",
  "task2Type": "advdis",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows the percentage of children who die before their fifth birthday in the United States, Kazakhstan, France and Egypt between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Child deaths before age five (% of children born)",
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
              1.1,
              0.8,
              0.7,
              0.7
            ]
          },
          {
            "name": "Kazakhstan",
            "data": [
              5.1,
              4.2,
              2,
              1
            ]
          },
          {
            "name": "France",
            "data": [
              0.9,
              0.5,
              0.4,
              0.4
            ]
          },
          {
            "name": "Egypt",
            "data": [
              8.6,
              4.7,
              3,
              2.4
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "child-mortality",
        "url": "https://ourworldindata.org/grapher/child-mortality",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Many companies now use artificial intelligence to carry out tasks that were once done by people.</p><p>Do the advantages of this development outweigh the disadvantages?</p>"
    }
  }
};
