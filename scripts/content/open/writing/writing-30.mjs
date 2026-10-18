// Vocably Writing 30 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (two) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-30",
  "title": "Writing 30: Fish and seafood supply per person",
  "difficulty": "hard",
  "dataset": "fish-and-seafood-consumption-per-capita",
  "task2Type": "two",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows the amount of fish and seafood available per person, in kilograms per year in the United States, France, Egypt and Indonesia between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Fish and seafood supply per person (kg per year)",
        "unit": "kg per year",
        "categories": [
          "1990",
          "2000",
          "2010",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "kg per year",
        "series": [
          {
            "name": "United States",
            "data": [
              22,
              22.3,
              21.5,
              22.2
            ]
          },
          {
            "name": "France",
            "data": [
              31.5,
              31.2,
              34.8,
              32.9
            ]
          },
          {
            "name": "Egypt",
            "data": [
              8.2,
              13.4,
              19.6,
              24.1
            ]
          },
          {
            "name": "Indonesia",
            "data": [
              14.5,
              19.9,
              27.4,
              39.3
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
      "promptHtml": "<p>In many countries, fewer young people are interested in learning traditional crafts and skills.</p><p>Why do you think this is happening, and is it a problem?</p>"
    }
  }
};
