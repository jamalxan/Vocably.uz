// Vocably Writing 17 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-17",
  "title": "Writing 17: GDP per person",
  "difficulty": "medium",
  "dataset": "gdp-per-capita-worldbank",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows gross domestic product (GDP) per person, in international dollars adjusted for inflation and price differences in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "GDP per person (international dollars)",
        "unit": "international $",
        "categories": [
          "2000",
          "2004",
          "2008",
          "2012",
          "2016",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "international $",
        "series": [
          {
            "name": "United Kingdom",
            "data": [
              43818,
              47317,
              49629,
              48100,
              51168,
              47931
            ]
          },
          {
            "name": "China",
            "data": [
              4066,
              5684,
              8744,
              12218,
              15773,
              19215
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              3431,
              3963,
              5146,
              6525,
              8173,
              9145
            ]
          },
          {
            "name": "India",
            "data": [
              3010,
              3551,
              4322,
              5304,
              6741,
              7187
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "gdp-per-capita-worldbank",
        "url": "https://ourworldindata.org/grapher/gdp-per-capita-worldbank",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people say that cities should have more green spaces such as parks, even if this means fewer buildings.</p><p>To what extent do you agree or disagree?</p>"
    }
  }
};
