<script>
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import * as d3 from 'd3';
    import MiniChart from './MiniChart.svelte';
    import { formatNumber } from '$lib/constants';

    export let width;
    export let height;
    export let temperature;
    export let currentIndex;

    let fill

    let tween = tweened(8, {
        duration: 400,
        easing: cubicOut
    });

    $: currentTemperature = temperature[currentIndex] || 0;

    $: yScale = d3.scaleLinear()
        .domain([8, 16])
        .range([50, 0])

    $: colorScale = d3.scaleLinear()
        .domain([8, 12.5, 15.4])
        .range(["#C9D5FF", "#FCE45E", "#A3181D"])
        .interpolate(d3.interpolate)

    $: if (temperature) {
        tween.set(currentTemperature);
        fill = colorScale($tween)
    }



</script>

<div class="bg">

    <MiniChart
    top={0}
    formatter={formatNumber}
    labelUnit={"°C"}
    data={temperature}
    {currentIndex}
    {yScale}
    zindex={1}/>

    <svg width={width} height={height + 60}>
        <rect
            x={0}
            y={0}
            width={width}
            height={height + 60}
            fill={fill}
        />
    </svg>
</div>

<style>

    .bg {
        position: absolute;
        text-align: center;
        z-index: 0;
    }



</style>