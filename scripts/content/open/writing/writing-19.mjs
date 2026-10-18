// Vocably Writing 19 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-19",
  "title": "Writing 19: Meat supply per person",
  "difficulty": "medium",
  "dataset": "meat-supply-per-person",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows the amount of meat available per person, in kilograms per year in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Meat supply per person (kg per year)",
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
              77.2,
              85,
              80.9,
              79.8,
              84.6,
              84.1
            ]
          },
          {
            "name": "China",
            "data": [
              44.4,
              47,
              54.1,
              57.9,
              62,
              58.7
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              21,
              23.8,
              26.5,
              34.8,
              37,
              38.9
            ]
          },
          {
            "name": "India",
            "data": [
              3.9,
              4.1,
              4.3,
              3.9,
              4.5,
              6.2
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "meat-supply-per-person",
        "url": "https://ourworldindata.org/grapher/meat-supply-per-person",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people believe that students should learn practical skills such as cooking and managing money at school, rather than only academic subjects.</p><p>Discuss both views and give your own opinion.</p>"
    }
  }
};
