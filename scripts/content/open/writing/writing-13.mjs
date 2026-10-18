// Vocably Writing 13 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-13",
  "title": "Writing 13: Children per woman",
  "difficulty": "medium",
  "dataset": "children-per-woman-un",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows the average number of children born per woman in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Children per woman (fertility rate)",
        "unit": "children per woman",
        "categories": [
          "2000",
          "2004",
          "2008",
          "2012",
          "2016",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "children per woman",
        "series": [
          {
            "name": "United Kingdom",
            "data": [
              1.64,
              1.75,
              1.91,
              1.91,
              1.78,
              1.57
            ]
          },
          {
            "name": "China",
            "data": [
              1.63,
              1.6,
              1.7,
              1.8,
              1.77,
              1.24
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              2.7,
              2.5,
              2.63,
              2.34,
              2.56,
              3.06
            ]
          },
          {
            "name": "India",
            "data": [
              3.35,
              3.05,
              2.71,
              2.47,
              2.28,
              2.05
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
      "promptHtml": "<p>It is often said that children spend too much time using screens such as phones, tablets and computers.</p><p>To what extent do you agree or disagree that parents should strictly limit screen time?</p>"
    }
  }
};
