// Vocably Writing 2 — Task 1 ma'lumotlari: Our World in Data (CC BY 4.0); qiymatlar CSV'dan avtomatik olingan.
// Task 2 mavzusi (opinion) Vocably uchun yozilgan. Generator: ../tools/writing-gen.mjs
export default {
  "slug": "vocably-writing-2",
  "title": "Writing 2: Life expectancy at birth",
  "difficulty": "medium",
  "dataset": "life-expectancy",
  "task2Type": "opinion",
  "writing": {
    "durationSec": 3600,
    "task1": {
      "order": 1,
      "minWords": 150,
      "recommendedMin": 20,
      "promptHtml": "<p>The bar chart below shows average life expectancy at birth in the United States, Kazakhstan, France and Egypt between 1990 and 2020.</p><p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p><p><em>Source: Our World in Data (ourworldindata.org), CC BY 4.0.</em></p>",
      "chart": {
        "chartType": "bar",
        "title": "Life expectancy at birth (years)",
        "unit": "years",
        "categories": [
          "1990",
          "2000",
          "2010",
          "2020"
        ],
        "xAxisLabel": "Year",
        "yAxisLabel": "years",
        "series": [
          {
            "name": "United States",
            "data": [
              75.4,
              76.8,
              78.7,
              77
            ]
          },
          {
            "name": "Kazakhstan",
            "data": [
              65.7,
              63.8,
              68.3,
              71.2
            ]
          },
          {
            "name": "France",
            "data": [
              76.8,
              79,
              81.4,
              82.2
            ]
          },
          {
            "name": "Egypt",
            "data": [
              62.5,
              67.3,
              69.1,
              69.8
            ]
          }
        ]
      },
      "source": {
        "kind": "owid",
        "dataset": "life-expectancy",
        "url": "https://ourworldindata.org/grapher/life-expectancy",
        "licence": "CC BY 4.0"
      }
    },
    "task2": {
      "order": 2,
      "minWords": 250,
      "recommendedMin": 40,
      "promptHtml": "<p>Many people believe that governments should spend more money on public transport than on building new roads.</p><p>To what extent do you agree or disagree?</p>"
    }
  }
};
