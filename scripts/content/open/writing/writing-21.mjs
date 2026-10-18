// Vocably Writing 21 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-21",
  "title": "Writing 21: Share of the population with access to electricity",
  "difficulty": "hard",
  "dataset": "share-of-the-population-with-access-to-electricity",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows the percentage of the population with access to electricity in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Share of the population with access to electricity (%)",
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
              100,
              100,
              100,
              100,
              100,
              100
            ]
          },
          {
            "name": "China",
            "data": [
              96.7,
              97.7,
              98.8,
              99.9,
              100,
              100
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              99.6,
              99.5,
              99.5,
              99.7,
              99.9,
              100
            ]
          },
          {
            "name": "India",
            "data": [
              60.3,
              64.4,
              74.1,
              79.9,
              89.6,
              96.5
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "share-of-the-population-with-access-to-electricity",
        "url": "https://ourworldindata.org/grapher/share-of-the-population-with-access-to-electricity",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people think that reading books for pleasure is a waste of time in the digital age.</p><p>To what extent do you agree or disagree?</p>"
    }
  }
};
