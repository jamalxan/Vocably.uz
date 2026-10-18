// Vocably Writing 11 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-11",
  "title": "Writing 11: Mobile phone subscriptions per 100 people",
  "difficulty": "medium",
  "dataset": "mobile-cellular-subscriptions-per-100-people",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows the number of mobile phone subscriptions per 100 people in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Mobile phone subscriptions per 100 people",
        "unit": "per 100 people",
        "categories": [
          "2000",
          "2004",
          "2008",
          "2012",
          "2016",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "per 100 people",
        "series": [
          {
            "name": "United Kingdom",
            "data": [
              73.6,
              99.2,
              120.8,
              122.5,
              119.8,
              117.3
            ]
          },
          {
            "name": "China",
            "data": [
              6.7,
              25.7,
              48.1,
              81.2,
              97.2,
              120.5
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              0.2,
              2.1,
              45,
              69.3,
              74.4,
              99.4
            ]
          },
          {
            "name": "India",
            "data": [
              0.3,
              4.6,
              28.7,
              67.6,
              83.9,
              82.3
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
      "promptHtml": "<p>Some people believe that it is the responsibility of the government to protect the environment, while others think individuals should take action.</p><p>Discuss both views and give your own opinion.</p>"
    }
  }
};
