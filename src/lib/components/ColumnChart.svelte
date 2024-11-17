<script>

    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import * as d3 from 'd3';
    import MiniChart from './MiniChart.svelte';
    import { formatNumber, labelVisibilityIndex } from '$lib/constants';

    export let width;
    export let height;
    export let forest;
    export let currentIndex;

    let tween = tweened(100, {
        duration: 800, 
        easing:cubicOut
    });

    $: currentForest = forest[currentIndex] || 100;

    $: miniYScale = d3.scaleLinear()
        .domain([0, 100])
        .range([50, 0])

    $: yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height || 0, 0])

   $: if(currentForest){
        tween.set(currentForest);
    }

    $: forestLabelTop = `${yScale($tween) + 5}px`;

    $: forestLabelAddition = currentIndex < labelVisibilityIndex ? "forest cover" : ""


</script>

{#if currentForest < 100}

    <MiniChart
        top={forestLabelTop}
        formatter={formatNumber}
        labelUnit={"%"}
        labelAddition={forestLabelAddition}
        data={forest}
        {currentIndex}
        yScale = {miniYScale}
        zindex={2}/>

{/if}

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