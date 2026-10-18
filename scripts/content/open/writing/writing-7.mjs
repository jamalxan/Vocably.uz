// Vocably Writing 7 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-7",
  "title": "Writing 7: Share of the population living in urban areas",
  "difficulty": "medium",
  "dataset": "share-of-population-urban",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows the percentage of the population living in urban areas in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Share of the population living in urban areas (%)",
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
              79.8,
              80.3,
              80.8,
              81.3,
              82,
              82.9
            ]
          },
          {
            "name": "China",
            "data": [
              36.4,
              41.8,
              47,
              53.1,
              58.8,
              63.5
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              47.7,
              50.6,
              51.8,
              51.3,
              50.7,
              50.8
            ]
          },
          {
            "name": "India",
            "data": [
              27.6,
              28.8,
              30.1,
              31.6,
              32.9,
              34.1
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "share-of-population-urban",
        "url": "https://ourworldindata.org/grapher/share-of-population-urban",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people believe that the best way to reduce crime is to give longer prison sentences. Others think there are better alternatives.</p><p>Discuss both views and give your own opinion.</p>"
    }
  }
};
