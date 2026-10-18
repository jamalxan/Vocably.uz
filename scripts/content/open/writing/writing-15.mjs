// Vocably Writing 15 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-15",
  "title": "Writing 15: Child deaths before age five",
  "difficulty": "hard",
  "dataset": "child-mortality",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows the percentage of children who die before their fifth birthday in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Child deaths before age five (% of children born)",
        "unit": "%",
        "categories": [
          "2000",
          "2004",
          "2008",
          "2012",
          "2016",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "%",
        "series": [
          {
            "name": "United Kingdom",
            "data": [
              0.7,
              0.6,
              0.6,
              0.5,
              0.4,
              0.4
            ]
          },
          {
            "name": "China",
            "data": [
              3.7,
              2.6,
              1.9,
              1.4,
              1,
              0.8
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              6.1,
              4.9,
              3.5,
              2.5,
              1.8,
              1.5
            ]
          },
          {
            "name": "India",
            "data": [
              9.2,
              7.8,
              6.5,
              5.2,
              4.1,
              3.3
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
      "promptHtml": "<p>Some people think that museums and art galleries should be free to enter. Others believe visitors should pay.</p><p>Discuss both views and give your own opinion.</p>"
    }
  }
};
