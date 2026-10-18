// Vocably Writing 10 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-10",
  "title": "Writing 10: Share of the population using the Internet",
  "difficulty": "medium",
  "dataset": "share-of-individuals-using-the-internet",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows the percentage of the population using the Internet in the United States, Kazakhstan, France and Egypt between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Share of the population using the Internet (%)",
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
              0.8,
              43.1,
              71.7,
              90.3
            ]
          },
          {
            "name": "Kazakhstan",
            "data": [
              0,
              0.7,
              31.6,
              85.9
            ]
          },
          {
            "name": "France",
            "data": [
              0.1,
              14.3,
              77.3,
              84.7
            ]
          },
          {
            "name": "Egypt",
            "data": [
              0,
              0.6,
              21.6,
              71.9
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "share-of-individuals-using-the-internet",
        "url": "https://ourworldindata.org/grapher/share-of-individuals-using-the-internet",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people think that online learning is as effective as studying in a classroom. Others disagree.</p><p>To what extent do you agree or disagree?</p>"
    }
  }
};
