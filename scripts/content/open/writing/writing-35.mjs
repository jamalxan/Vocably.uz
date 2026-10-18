// Vocably Writing 35 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-35",
  "title": "Writing 35: Average years of schooling",
  "difficulty": "medium",
  "dataset": "mean-years-of-schooling",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows the average number of years of schooling received by adults in the United States, France, Egypt and Indonesia between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Average years of schooling",
        "unit": "years",
        "categories": [
          "1990",
          "2000",
          "2010",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "years",
        "series": [
          {
            "name": "United States",
            "data": [
              12.6,
              13.1,
              13.2,
              13.3
            ]
          },
          {
            "name": "France",
            "data": [
              8.3,
              10.2,
              11.3,
              11.9
            ]
          },
          {
            "name": "Egypt",
            "data": [
              4.6,
              6.3,
              7.4,
              8
            ]
          },
          {
            "name": "Indonesia",
            "data": [
              4.4,
              5.4,
              8,
              9.1
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "mean-years-of-schooling",
        "url": "https://ourworldindata.org/grapher/mean-years-of-schooling",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people believe that students learn better when they are taught in small classes, while others feel that class size makes little difference.</p><p>Discuss both views and give your own opinion.</p>"
    }
  }
};
