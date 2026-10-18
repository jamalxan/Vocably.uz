// Vocably Writing 12 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (two) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-12",
  "title": "Writing 12: Mobile phone subscriptions per 100 people",
  "difficulty": "hard",
  "dataset": "mobile-cellular-subscriptions-per-100-people",
  "task2Type": "two",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows the number of mobile phone subscriptions per 100 people in the United States, Kazakhstan, France and Egypt between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Mobile phone subscriptions per 100 people",
        "unit": "per 100 people",
        "categories": [
          "1990",
          "2000",
          "2010",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "per 100 people",
        "series": [
          {
            "name": "United States",
            "data": [
              2.1,
              38.9,
              91.7,
              103.9
            ]
          },
          {
            "name": "Kazakhstan",
            "data": [
              0,
              1.3,
              115.2,
              124.7
            ]
          },
          {
            "name": "France",
            "data": [
              0.5,
              48.8,
              91.1,
              110.4
            ]
          },
          {
            "name": "Egypt",
            "data": [
              0,
              1.9,
              79.2,
              87.2
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "mobile-cellular-subscriptions-per-100-people",
        "url": "https://ourworldindata.org/grapher/mobile-cellular-subscriptions-per-100-people",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>In some countries, a growing number of people are choosing to live alone.</p><p>What are the reasons for this trend, and is it a positive or negative development?</p>"
    }
  }
};
