// Vocably Writing 38 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (problem) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-38",
  "title": "Writing 38: Vegetable supply per person",
  "difficulty": "medium",
  "dataset": "vegetable-consumption-per-capita",
  "task2Type": "problem",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows the amount of vegetables available per person, in kilograms per year in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Vegetable supply per person (kg per year)",
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
              87.3,
              90.4,
              92.3,
              159,
              161.7,
              175.1
            ]
          },
          {
            "name": "China",
            "data": [
              245,
              277.1,
              319,
              337.5,
              369.2,
              392.3
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              108.5,
              124.4,
              189,
              250.3,
              335.1,
              253.8
            ]
          },
          {
            "name": "India",
            "data": [
              63.3,
              53.3,
              69.1,
              80.7,
              85.7,
              89.3
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "vegetable-consumption-per-capita",
        "url": "https://ourworldindata.org/grapher/vegetable-consumption-per-capita",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>In many countries, a large amount of food is wasted every day by shops, restaurants and households.</p><p>Why does this happen, and what can be done to reduce food waste?</p>"
    }
  }
};
