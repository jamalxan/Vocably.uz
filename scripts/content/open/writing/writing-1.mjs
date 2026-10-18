// Vocably Writing 1 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-1",
  "title": "Writing 1: Life expectancy at birth",
  "difficulty": "medium",
  "dataset": "life-expectancy",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows average life expectancy at birth in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Life expectancy at birth (years)",
        "unit": "years",
        "categories": [
          "2000",
          "2004",
          "2008",
          "2012",
          "2016",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "years",
        "series": [
          {
            "name": "United Kingdom",
            "data": [
              77.8,
              78.9,
              79.7,
              80.9,
              81.1,
              80.4
            ]
          },
          {
            "name": "China",
            "data": [
              72.3,
              73.7,
              74.8,
              76.2,
              77.2,
              78
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              65.5,
              67.2,
              69,
              70.4,
              71.6,
              71.5
            ]
          },
          {
            "name": "India",
            "data": [
              62.7,
              64.5,
              66.2,
              68.1,
              69.7,
              70.2
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "life-expectancy",
        "url": "https://ourworldindata.org/grapher/life-expectancy",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people think that children should start learning a foreign language at primary school, while others believe it is better to wait until secondary school.</p><p>Discuss both views and give your own opinion.</p>"
    }
  }
};
