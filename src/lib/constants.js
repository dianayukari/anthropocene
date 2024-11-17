import * as d3 from 'd3';

d3.formatDefaultLocale({
    "decimal": ",",
    "thousands": ".",
    "grouping": [3],
})

export const formatNumber = d3.format(",.2f");
export const labelVisibilityIndex = 11779;