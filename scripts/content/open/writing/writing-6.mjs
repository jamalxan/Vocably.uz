// Vocably Writing 6 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-6",
  "title": "Writing 6: Share of electricity from renewables",
  "difficulty": "hard",
  "dataset": "share-electricity-renewables",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows the percentage of electricity generated from renewable sources in the United States, Kazakhstan, France and Egypt between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Share of electricity from renewables (%)",
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
              10.9,
              9.2,
              10.3,
              20.3
            ]
          },
          {
            "name": "Kazakhstan",
            "data": [
              8.4,
              14.6,
              9.7,
              11
            ]
          },
          {
            "name": "France",
            "data": [
              13.1,
              12.7,
              13.6,
              23.7
            ]
          },
          {
            "name": "Egypt",
            "data": [
              23.7,
              19.4,
              10,
              12
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "share-electricity-renewables",
        "url": "https://ourworldindata.org/grapher/share-electricity-renewables",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people say that university education should be free for everyone, whereas others believe students should pay for it.</p><p>Discuss both views and give your own opinion.</p>"
    }
  }
};
