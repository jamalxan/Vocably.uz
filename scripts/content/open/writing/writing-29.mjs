// Vocably Writing 29 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-29",
  "title": "Writing 29: Fish and seafood supply per person",
  "difficulty": "medium",
  "dataset": "fish-and-seafood-consumption-per-capita",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows the amount of fish and seafood available per person, in kilograms per year in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Fish and seafood supply per person (kg per year)",
        "unit": "kg per year",
        "categories": [
          "2000",
          "2004",
          "2008",
          "2012",
          "2016",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "kg per year",
        "series": [
          {
            "name": "United Kingdom",
            "data": [
              20.4,
              21.5,
              21.1,
              20.2,
              19.9,
              18.1
            ]
          },
          {
            "name": "China",
            "data": [
              24.6,
              26.8,
              30.6,
              33.9,
              38.9,
              41.1
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              0.4,
              0.3,
              0.4,
              1.3,
              2.2,
              4.6
            ]
          },
          {
            "name": "India",
            "data": [
              4.4,
              4.7,
              5.8,
              5.8,
              6.9,
              8.3
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "fish-and-seafood-consumption-per-capita",
        "url": "https://ourworldindata.org/grapher/fish-and-seafood-consumption-per-capita",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people say that the traditional culture of a country is being lost because of globalisation.</p><p>Discuss both views and give your own opinion on whether this is a problem.</p>"
    }
  }
};
