// Vocably Writing 25 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-25",
  "title": "Writing 25: Energy use per person",
  "difficulty": "medium",
  "dataset": "per-capita-energy-use",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows primary energy use per person, in kilowatt-hours in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Energy use per person (kWh)",
        "unit": "kWh",
        "categories": [
          "2000",
          "2004",
          "2008",
          "2012",
          "2016",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "kWh",
        "series": [
          {
            "name": "United Kingdom",
            "data": [
              45178,
              44838,
              41153,
              36828,
              33180,
              27433
            ]
          },
          {
            "name": "China",
            "data": [
              8954,
              13713,
              18642,
              22599,
              23412,
              26383
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              23411,
              21034,
              18469,
              17447,
              15676,
              15781
            ]
          },
          {
            "name": "India",
            "data": [
              3379,
              3661,
              4425,
              5236,
              5929,
              5952
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "per-capita-energy-use",
        "url": "https://ourworldindata.org/grapher/per-capita-energy-use",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people believe that advertising has a negative effect on society, especially on young people.</p><p>To what extent do you agree or disagree?</p>"
    }
  }
};
