<script>

    import {onMount} from 'svelte';
    import * as d3 from 'd3';
	import { scale } from 'svelte/transition';

    let y = 0
    let countdownNumbers = [];
    let currentIndex = 0
    let label = []

    let pauseIndices = []
    let pauseScrolls = 60
    let totalScrolls

    let chartWidth
    let chartHeight

    let data = []

    onMount(async() => {

        window.onbeforeunload = function () {
        window.scrollTo(0, 0);
    }

        data = await d3.csv("/timeline.csv");
        countdownNumbers = data.map(d => d.years_ago);
        label = data.map(d => d.event.replaceAll(";", ";\n"))
        pauseIndices = data.filter(d => d.event !== "NA").map(d => d.years_ago)

        totalScrolls = countdownNumbers.length + (pauseIndices.length*pauseScrolls)

        chartHeight = window.innerHeight
        chartWidth = window.innerWidth

    });            

    function handleScroll(e) {
        const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        let scrollIndex = Math.floor(scrollPct*totalScrolls)
        let adjustedIndex = 0
        let pauseCount = 0

        for(let i = 0; i < countdownNumbers.length; i++) {            

           if(pauseIndices.includes(countdownNumbers[i])) {
             
            if(scrollIndex >= adjustedIndex + pauseScrolls) {
                adjustedIndex += pauseScrolls;
                pauseCount++;
            } else {
                break;
            }
           } 

           if(scrollIndex >= adjustedIndex) {
                adjustedIndex++;
           } else {
                break
           }

        } 

        currentIndex = Math.min(adjustedIndex - (pauseCount * pauseScrolls), countdownNumbers.length -1)
        
    }

    $: yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([chartHeight, 0])
        
    $: forestPct = data.map(d => +d.pct)
    $: column = forestPct[currentIndex]


    $: temp = data.map(d => +d.temp)
    $: bg = temp[currentIndex]

    $: colorScale = d3.scaleLinear()
        .domain([8, 12.5, 15.4])
        .range(["#F6F8FF", "#FFFDE4", "#FAB9B9"])
        .interpolate(d3.interpolate)

    $: console.log(bg);
    

</script>

<svelte:window on:scroll={handleScroll}/>

<div class="scroll-container" style="--total-scrolls: {totalScrolls}">

    <div class="container">

        <p class="temp-label">{bg}</p>

        <div class="bg">
            <svg width={chartWidth} height={chartHeight}>
                <rect
                    x={0}
                    y={0}
                    width={chartWidth}
                    height={chartHeight}
                    fill={colorScale(bg)}
                />
            </svg>
        </div>

        <div class="countdown">
            {#if countdownNumbers[currentIndex]}
               <p class="yearsAgo">{countdownNumbers[currentIndex]} years ago</p>
                <p class="event">{label[currentIndex]}</p>
            {/if}
        </div>

        <p class="forest-label">{column}</p>

        <div class="chart">
            <svg width={chartWidth} height={chartHeight}>
                <rect
                    x={0}
                    y={yScale(column)}
                    width={chartWidth}
                    height={chartHeight - yScale(column)}
                    fill="green"
                />
            </svg>
        </div>

    </div>



</div>

<style>

    .scroll-container {
        height: 5000vh;
    }


    .yearsAgo {
        text-align: center;
    }

    .event {
        white-space: pre-line
    }

    .bg {
        position: absolute;
        /* display: inline; */
    }

    .container {
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: fixed;
        right: 0;
        left: 0;
    }

    .temp-label {
        position: absolute;
        z-index: 2;
    }

    .forest-label {
        z-index: 2;
        position: absolute;
        top: 90vh;
    }

    .countdown {
        width: 180px;
        position: fixed;
        top: 50%;
        left: calc(50% - 90px);
        z-index: 2;
    }

    .chart {
        z-index: 1;
    }


</style>