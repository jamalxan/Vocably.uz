// Vocably Writing 5 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (two) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-5",
  "title": "Writing 5: Share of electricity from renewables",
  "difficulty": "medium",
  "dataset": "share-electricity-renewables",
  "task2Type": "two",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows the percentage of electricity generated from renewable sources in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Share of electricity from renewables (%)",
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
              2.6,
              3.6,
              5.6,
              11.3,
              24.5,
              43.1
            ]
          },
          {
            "name": "China",
            "data": [
              16.6,
              16.2,
              19,
              20,
              24.8,
              28.1
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              7.5,
              12.3,
              8.9,
              12.5,
              11.7,
              7.5
            ]
          },
          {
            "name": "India",
            "data": [
              14,
              15.6,
              16.8,
              14.9,
              14.4,
              19
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "share-electricity-renewables",
        "url": "https://ourworldindata.org/grapher/share-electricity-renewables",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Nowadays many young people spend a lot of their free time on social media.</p><p>Why is this the case? Is it a positive or negative development?</p>"
    }
  }
};
