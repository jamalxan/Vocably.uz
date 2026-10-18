// Vocably Writing 23 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-23",
  "title": "Writing 23: Share of land covered by forest",
  "difficulty": "medium",
  "dataset": "forest-area-as-share-of-land-area",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows the percentage of the land area covered by forest in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Share of land covered by forest (%)",
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
              12.2,
              12.4,
              12.6,
              12.8,
              13.1,
              13.3
            ]
          },
          {
            "name": "China",
            "data": [
              18.9,
              19.9,
              20.9,
              21.8,
              22.6,
              23.3
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              6.7,
              7.1,
              7.4,
              7.8,
              8.1,
              8.4
            ]
          },
          {
            "name": "India",
            "data": [
              22.7,
              23,
              23.2,
              23.6,
              23.9,
              24.3
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "forest-area-as-share-of-land-area",
        "url": "https://ourworldindata.org/grapher/forest-area-as-share-of-land-area",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some parents believe that competitive sports are good for children, while others think they put too much pressure on them.</p><p>Discuss both views and give your own opinion.</p>"
    }
  }
};
