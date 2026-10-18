// Vocably Writing 20 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (problem) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-20",
  "title": "Writing 20: Meat supply per person",
  "difficulty": "medium",
  "dataset": "meat-supply-per-person",
  "task2Type": "problem",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows the amount of meat available per person, in kilograms per year in the United States, France, Egypt and Indonesia between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Meat supply per person (kg per year)",
        "unit": "kg per year",
        "categories": [
          "1990",
          "2000",
          "2010",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "kg per year",
        "series": [
          {
            "name": "United States",
            "data": [
              113.2,
              123,
              119.3,
              125.6
            ]
          },
          {
            "name": "France",
            "data": [
              98.5,
              99.6,
              90.6,
              83.8
            ]
          },
          {
            "name": "Egypt",
            "data": [
              15,
              20.7,
              24.5,
              28.9
            ]
          },
          {
            "name": "Indonesia",
            "data": [
              7.9,
              8.1,
              10.4,
              17.4
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "meat-supply-per-person",
        "url": "https://ourworldindata.org/grapher/meat-supply-per-person",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>The world’s population is growing quickly, and many cities are becoming overcrowded.</p><p>What problems does this cause, and what solutions can you suggest?</p>"
    }
  }
};
