<script>

    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import * as d3 from 'd3';

    export let width;
    export let height;
    export let forest;
    export let currentIndex;

    let tween = tweened(0.97, {
        duration: 800, 
        easing:cubicOut
    });

    $: currentForest = forest[currentIndex] || 100;

    $: yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height || 0, 0])

    if (forest) {
        tween.set(currentForest);
    }

</script>

<div class="chart">
    <svg width={width} height={height}>
        <rect
            x={width * 0.075}
            y={yScale($tween)}
            width={width * 0.85}
            height={height - yScale($tween)}
            fill="#0C584C"
        />
    </svg>
</div>

<style>

    .chart {
        z-index: 1;
    }

</style>