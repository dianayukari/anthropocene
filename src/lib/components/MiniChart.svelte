<script>

    import * as d3 from 'd3';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    export let top = 0;
    export let formatter;
    export let currentIndex;
    export let labelUnit;
    export let data;
    export let yScale;
    export let zindex;

    let tween = tweened(0, {
            duration: 400,
            easing: cubicOut
        });

    $: pathLength = Math.min(currentIndex, data.length - 1)
    tween.set(pathLength)

    $: lineGenerator = d3.line()
        .x((d, i) => i * (50 / data.length))
        .y(d => yScale(d))
        .curve(d3.curveMonotoneX)(data.slice(0, $tween));

    $: currentData = data[currentIndex];


</script>

<div class="minichart-container" style="top: {top}; z-index: {zindex};">
    <p class="minichart-label">{formatter(currentData)}{labelUnit}</p>
    <div class="minichart" >
        <svg width={100} height={60}>
            <path
                d={lineGenerator}
                fill="none"
                stroke="white"
                stroke-width="2"
            />
        </svg>
    </div>
</div>

<style>

    .minichart-container {
        position: absolute;
        color: white;
        z-index: 2;
        margin-left: 10%;
    }

    .minichart-label  {
        margin-bottom: 5px;
        font-weight: 600;
    }

    .minichart {
        position: absolute;
    }

    

</style>