// Vocably Writing 36 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (two) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-36",
  "title": "Writing 36: Transport CO₂ emissions per person",
  "difficulty": "hard",
  "dataset": "per-capita-co2-transport",
  "task2Type": "two",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The graph below shows carbon dioxide emissions from transport per person, in tonnes in the United Kingdom, China, Uzbekistan and India between 2000 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "line",
        "title": "Transport CO₂ emissions per person (tonnes)",
        "unit": "tonnes",
        "categories": [
          "2000",
          "2004",
          "2008",
          "2012",
          "2016",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "tonnes",
        "series": [
          {
            "name": "United Kingdom",
            "data": [
              2081.88,
              2093.74,
              1978.81,
              1796.58,
              1845.86,
              1398.92
            ]
          },
          {
            "name": "China",
            "data": [
              195.72,
              285.03,
              380.16,
              501,
              602.09,
              725.55
            ]
          },
          {
            "name": "Uzbekistan",
            "data": [
              544.64,
              467.93,
              471.36,
              348.92,
              262.43,
              465.37
            ]
          },
          {
            "name": "India",
            "data": [
              89.88,
              95.12,
              135.12,
              173.24,
              202.78,
              194.83
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "per-capita-co2-transport",
        "url": "https://ourworldindata.org/grapher/per-capita-co2-transport",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Some people choose to spend their whole career with one company, while others change jobs frequently.</p><p>What are the advantages of each approach? Which do you prefer?</p>"
    }
  }
};
