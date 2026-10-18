// Vocably Writing 33 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-33",
  "title": "Writing 33: Women in the national parliament",
  "difficulty": "hard",
  "dataset": "share-of-women-in-parliament",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows the percentage of parliamentary seats held by women in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Women in the national parliament (% of seats)",
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
              18.2,
              17.8,
              19.8,
              22.9,
              30,
              33.9
            ]
          },
          {
            "name": "China",
            "data": [
              21.8,
              20.2,
              21.3,
              21.3,
              23.7,
              24.9
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              7.2,
              17.5,
              17.5,
              22,
              16,
              32.6
            ]
          },
          {
            "name": "India",
            "data": [
              8.8,
              8.3,
              8.3,
              10.8,
              11.8,
              14.4
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "share-of-women-in-parliament",
        "url": "https://ourworldindata.org/grapher/share-of-women-in-parliament",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people think that team sports teach children more valuable life skills than individual sports.</p><p>Do you agree or disagree?</p>"
    }
  }
};
