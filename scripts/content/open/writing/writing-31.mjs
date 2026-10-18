// Vocably Writing 31 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-31",
  "title": "Writing 31: Electricity generated per person",
  "difficulty": "medium",
  "dataset": "per-capita-electricity-generation",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows electricity generated per person, in kilowatt-hours in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Electricity generated per person (kWh)",
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
              6385,
              6547,
              6271,
              5689,
              5147,
              4607
            ]
          },
          {
            "name": "China",
            "data": [
              1068,
              1692,
              2621,
              3642,
              4368,
              5455
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              1891,
              1909,
              1827,
              1811,
              1877,
              1981
            ]
          },
          {
            "name": "India",
            "data": [
              540,
              615,
              686,
              851,
              1038,
              1115
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "per-capita-electricity-generation",
        "url": "https://ourworldindata.org/grapher/per-capita-electricity-generation",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people believe that doctors should spend more time on preventing illness than on treating it.</p><p>To what extent do you agree or disagree?</p>"
    }
  }
};
