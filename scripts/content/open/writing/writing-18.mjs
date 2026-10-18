// Vocably Writing 18 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (two) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-18",
  "title": "Writing 18: GDP per person",
  "difficulty": "hard",
  "dataset": "gdp-per-capita-worldbank",
  "task2Type": "two",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows gross domestic product (GDP) per person, in international dollars adjusted for inflation and price differences in the United States, Kazakhstan, France and Egypt between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "GDP per person (international dollars)",
        "unit": "international $",
        "categories": [
          "1990",
          "2000",
          "2010",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "international $",
        "series": [
          {
            "name": "United States",
            "data": [
              44384,
              55046,
              59797,
              67407
            ]
          },
          {
            "name": "Kazakhstan",
            "data": [
              16838,
              12936,
              26375,
              32012
            ]
          },
          {
            "name": "France",
            "data": [
              38656,
              45922,
              49130,
              49311
            ]
          },
          {
            "name": "Egypt",
            "data": [
              8007,
              9982,
              13129,
              15309
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
      "promptHtml": "<p>Fast food is becoming more popular around the world, and traditional home cooking is declining.</p><p>Why is this happening? What effects will it have on people and society?</p>"
    }
  }
};
