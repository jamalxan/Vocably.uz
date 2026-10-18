// Vocably Writing 34 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (advdis) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-34",
  "title": "Writing 34: Women in the national parliament",
  "difficulty": "medium",
  "dataset": "share-of-women-in-parliament",
  "task2Type": "advdis",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows the percentage of parliamentary seats held by women in the United States, Kazakhstan, France and Egypt between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Women in the national parliament (% of seats)",
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
              6.4,
              14,
              16.8,
              27.3
            ]
          },
          {
            "name": "Kazakhstan",
            "data": [
              0,
              10.4,
              17.8,
              27.1
            ]
          },
          {
            "name": "France",
            "data": [
              6.9,
              10.9,
              18.5,
              39.5
            ]
          },
          {
            "name": "Egypt",
            "data": [
              2.2,
              2.4,
              12.7,
              27.4
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "share-of-women-in-parliament",
        "url": "https://ourworldindata.org/grapher/share-of-women-in-parliament",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Many people now prefer to pay by card or phone instead of using cash.</p><p>Do the advantages of a cashless society outweigh the disadvantages?</p>"
    }
  }
};
