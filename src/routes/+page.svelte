<script>

    import {onMount} from 'svelte';
    import * as d3 from 'd3';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { fade } from 'svelte/transition';

    d3.formatDefaultLocale({
        "decimal": ",",
        "thousands": ".",
        "grouping": [3],
    })

    let formatNumber = d3.format(",.2f");

    let countdownNumbers = [];
    let currentIndex = 0
    let label = []
    let year = []
    let yearsAgo = []

    let pauseIndices = []
    let pauseScrolls = 60
    let totalScrolls

    let chartWidth
    let chartHeight

    let data = []
    let forestPct= []
    let temp = []

    let displayedEvents = []

    let dataReady = false

    onMount(async() => {

        window.onbeforeunload = function () {
            window.scrollTo(0, 0);
        }

        data = await d3.csv("/timeline.csv");

        forestPct = data.map(d => +d.pct);
        temp = data.map(d => +d.temp);

        countdownNumbers = data.map(d => d.years_ago);
        year = data.map(d => d.year);
        yearsAgo = data.map(d => +d.years_ago);
        label = data.map(d => d.event.replaceAll(";", `;<span class="spacer" style="display: block; height: 10px;"></span>`));
        pauseIndices = data.filter(d => d.event !== "NA").map(d => d.years_ago)

        totalScrolls = countdownNumbers.length + (pauseIndices.length*pauseScrolls)

        chartHeight = window.innerHeight
        chartWidth = window.innerWidth

        dataReady = true;
    });            

    //SCROLL

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
        
        const newEvent = { year: year[currentIndex], event: label[currentIndex], yearsAgo: yearsAgo[currentIndex]  };

        if (label[currentIndex] !== "NA") {
            if (!displayedEvents.some(e => e.event === newEvent.event)) {
                displayedEvents.forEach(e => e.yOffset = (e.yOffset || 0) - 15);
                displayedEvents.push({ ...newEvent, yOffset: 0 });
                
                if (displayedEvents.length > 4) {
                    displayedEvents.shift();
                }

                displayedEvents = [...displayedEvents];
            }
        }

    }

    //SCALES

    $: yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([chartHeight || 0, 0])

    $: colorScale = d3.scaleLinear()
        .domain([8, 12.5, 15.4])
        .range(["#C9D5FF", "#F2DF80", "#D45944"])
        .interpolate(d3.interpolate)

    //TRANSITIONS

    let tweenedColumn = tweened(0.97, {
        duration: 800, 
        easing:cubicOut
    });

    let tweenedBg = tweened(8, {
        duration: 400,
        easing: cubicOut
    });

    $: column = forestPct[currentIndex]
    $: bg = temp[currentIndex]
    
    $: if (dataReady) {
        tweenedColumn.set(column);
        tweenedBg.set(bg);
    }

    $: forestLabelTop = `${yScale($tweenedColumn) + 5}px`;

    $: console.log(yearsAgo[currentIndex]<1300)


</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400..700;1,400..700&family=Roboto+Slab:wght@100..900&display=swap" rel="stylesheet">
</svelte:head>

<svelte:window on:scroll={handleScroll}/>

{#if dataReady}

    <div class="scroll-container" style="--total-scrolls: {totalScrolls}">

        <div class="container">

            {#if yearsAgo[currentIndex] < 13000}
                  
                {#if currentIndex === 0}

                    {#key column}
                        <p class="forest-label" style="top: {forestLabelTop};">{formatNumber(column*100)}% <span class="explainer" out:fade>forest cover that year</span> </p>
                    {/key}

                    {#key bg}
                        <p class="temp-label" style="top: 3px;">{formatNumber(bg)}ºC <span class="explainer" out:fade> temperature that year</span></p>
                    {/key}

                
                {:else}
                    <p class="forest-label" style="top: {forestLabelTop};">{formatNumber(column*100)}%</p>
                    <p class="temp-label" style="top: 3px;">{formatNumber(bg)}ºC</p>
                {/if}

            {/if}

            <div class="bg">
                <svg width={chartWidth} height={chartHeight}>
                    <rect
                        x={0}
                        y={0}
                        width={chartWidth}
                        height={chartHeight}
                        fill={colorScale($tweenedBg)}
                    />
                </svg>
            </div>

            <div class="countdown">
                {#if countdownNumbers[currentIndex]}
                    <p class="yearsAgo">{d3.format(",")(countdownNumbers[currentIndex])} <br><span class="smallYears">years ago</span></p>

                {/if}
            </div>

            <div class="chart">
                <svg width={chartWidth} height={chartHeight}>
                    <rect
                        x={0}
                        y={yScale($tweenedColumn)}
                        width={chartWidth}
                        height={chartHeight - yScale($tweenedColumn)}
                        fill="#336B62"
                    />
                </svg>
            </div>

            <div class="event-container">
                {#each displayedEvents as { year, event, yOffset, yearsAgo } (event)}
                    
                        <p class="year" style="transform: translateY({yOffset}px); transition: transform 0.3s ease;">
                            {#if yearsAgo < 12000}
                                {year}
                            {/if}
                            </p>
                    
                        <p class="event" style="transform: translateY({yOffset}px); transition: transform 0.3s ease;">{@html event}</p>
                {/each}                
            </div>

        </div>
    </div>

{:else}
    <p>Loading...</p>
{/if}



<style>

    :global(body) {
        font-family: "Fira Sans", serif;
    }

    .scroll-container {
        height: 5000vh;
    }

    .yearsAgo {
        color: white;
        font-size: 35px;
        line-height: 20px;
        font-weight: 400;
        margin: 0;
    }

    .smallYears {
        font-size: 14px;
        font-weight: 200;
    }

    .event-container {
        position: absolute;
        top: 50%;
        left: 70%;
        transform: translate(-50%, -50%);
        align-items: top;
        width: 50%;
        max-height: 60vh;
        overflow: hidden;
        z-index: 1;
    }

    .spacer {
        display: block;
        height: 6px;
    }

    .year {
        color: white;
        font-weight: 500;
        margin: 0;
    }

    .event {
        white-space: pre-line;
        color: white;
        font-size: 14px;
        transition: transform 1ms ease;
        margin-top: 6px;
    }

    .bg {
        position: absolute;
        text-align: center;
    }

    .container {
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        /* align-items: center; */
        position: fixed;
        right: 0;
        left: 0;
    }

    .temp-label {
        position: absolute;
        text-align: right;
        z-index: 2;
        color: white;
        margin-left: 20px;
        /* top: 8px; */
    }

    .forest-label {
        z-index: 2;
        position: absolute;
        color: white;
        margin-left: 20px;
    }

    .explainer {
        font-size: 12px;
        font-weight: 200;
    }

    .countdown {
        width: 180px;
        position: fixed;
        top: 50%;
        /* left: calc(50% - 90px); */
        left: 20px;
        z-index: 2;
    }

    .chart {
        z-index: 1;
    }


</style>