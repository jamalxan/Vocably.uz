// Vocably Writing 9 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (advdis) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-9",
  "title": "Writing 9: Share of the population using the Internet",
  "difficulty": "hard",
  "dataset": "share-of-individuals-using-the-internet",
  "task2Type": "advdis",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows the percentage of the population using the Internet in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Share of the population using the Internet (%)",
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
              26.8,
              65.6,
              78.4,
              87.5,
              94.8,
              94.8
            ]
          },
          {
            "name": "China",
            "data": [
              1.8,
              7.3,
              22.6,
              42.3,
              53.2,
              70.1
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              0.5,
              2.6,
              9.1,
              23.6,
              46.8,
              71.1
            ]
          },
          {
            "name": "India",
            "data": [
              0.5,
              2,
              4.4,
              11.1,
              16.5,
              43.4
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "share-of-individuals-using-the-internet",
        "url": "https://ourworldindata.org/grapher/share-of-individuals-using-the-internet",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>An increasing number of people travel abroad on holiday every year.</p><p>Do the benefits of international tourism outweigh the drawbacks for local communities?</p>"
    }
  }
};
