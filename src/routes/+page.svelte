<script>

    import {onMount} from 'svelte';
    import * as d3 from 'd3';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

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
    let tempStart = []

    let displayedEvents = [{event:"Scroll to start"}]
    let pathLength = 0
    let lineTween = tweened(0, {
        duration: 400,
        easing: cubicOut
    });

    let dataReady = false

    onMount(async() => {

        window.onbeforeunload = function () {
            window.scrollTo(0, 0);
        }

        data = await d3.csv("/timeline.csv");

        forestPct = data.map(d => +d.pct);
        temp = data.map(d => +d.temp);
        tempStart = temp.slice(44, temp.length)

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

            if(currentIndex == data.length - 1) {
                displayedEvents = [newEvent]
            } else if (!displayedEvents.some(e => e.event === newEvent.event)) {
                displayedEvents.forEach(e => e.yOffset = (e.yOffset || 0));
                displayedEvents.push({ ...newEvent, yOffset: 0 });
                
                if (displayedEvents.length > 1) {
                    displayedEvents.shift();
                }

                displayedEvents = [...displayedEvents];
            }
        }

        pathLength = Math.min(currentIndex, forestPct.length - 1)
        lineTween.set(pathLength)
    }

    //SCALES

    $: miniYScale = d3.scaleLinear()
        .domain([0, 1])
        .range([60, 0])

    $: miniYScaleTemp = d3.scaleLinear()
        .domain([8, 16])
        .range([60, 0])

    $: yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([chartHeight || 0, 0])

    $: colorScale = d3.scaleLinear()
        .domain([8, 12.5, 15.4])
        .range(["#C9D5FF", "#FCE45E", "#A3181D"])
        .interpolate(d3.interpolate)

    $: miniLineGenerator = d3.line()
        .x((d, i) => i * (40 / forestPct.length))
        .y(d => miniYScale(d))
        .curve(d3.curveMonotoneX)(forestPct.slice(0, $lineTween));

    $: miniLineGeneratorTemp = d3.line()
        .x((d, i) => i * (45 / tempStart.length))
        .y(d => miniYScaleTemp(d))
        .curve(d3.curveMonotoneX)(temp.slice(0, $lineTween));

    //TRANSITIONS

    let tweenedColumn = tweened(0.97, {
        duration: 800, 
        easing:cubicOut
    });

    let tweenedBg = tweened(8, {
        duration: 400,
        easing: cubicOut
    });

    $: column = forestPct[currentIndex] || 100
    $: bg = temp[currentIndex] || 0
    
    $: if (dataReady) {
        tweenedColumn.set(column);
        tweenedBg.set(bg);
    }

    $: forestLabelTop = `${yScale($tweenedColumn) + 5}px`;


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
                  
                {#if yearsAgo[currentIndex] > 1000}

                    {#key column}
                        <div class="forest-container">
                            <p class="forest-label" style="top: {forestLabelTop};">{formatNumber(column*100)}% <span class="explainer">forest cover that year</span> </p>
                            <div class="mini-chart" style="top: {forestLabelTop};">
                                <svg width={50} height={50}>
                                    <path
                                        d={miniLineGenerator}
                                        fill="none"
                                        stroke="white"
                                        stroke-width="2"
                                    />
                                </svg>
                            </div>
                        </div>
                    {/key}

                    {#key bg}
                    <div class="temp-container">
                        <p class="temp-label" style="top: 3px;">{formatNumber(bg)}ºC <span class="explainer"> temperature that year</span></p>
                        <div class="mini-chart-temp">
                            <svg width={50} height={50}>
                                    <path
                                        d={miniLineGeneratorTemp}
                                        fill="none"
                                        stroke="white"
                                        stroke-width="2"
                                        
                                    />
                            </svg>
                        </div>
                    </div>
                    {/key}

                
                {:else}
                    <div class="forest-container">
                        <p class="forest-label" style="top: {forestLabelTop};">{formatNumber(column*100)}%</p>
                        <div class="mini-chart" style="top: {forestLabelTop};">
                            <svg width={50} height={50}>
                                <path
                                    d={miniLineGenerator}
                                    fill="none"
                                    stroke="white"
                                    stroke-width="2"
                                />
                            </svg>
                        </div>
                    </div>
                <div class="temp-container">
                    <p class="temp-label" style="top: 3px;">{formatNumber(bg)}ºC</p>
                    <div class="mini-chart-temp">
                        <svg width={50} height={50}>
                            <path
                                d={miniLineGeneratorTemp}
                                fill="none"
                                stroke="white"
                                stroke-width="2"
                            />
                        </svg>
                    </div>
                </div>
                {/if}



            {/if}

            <div class="countdownContainer">

                <div class="countdown">
                    {#if yearsAgo[currentIndex] > 12000}
                        <p class="yearsAgo">{d3.format(".1f")(countdownNumbers[currentIndex]/1000000000)}<p class="smallYears">billion of years ago</p>
                    {:else if countdownNumbers[currentIndex] && yearsAgo[currentIndex] <= 12000}
                        <p class="yearsAgo">{d3.format(",")(countdownNumbers[currentIndex])}<p class="smallYears">years ago</p>
                    {/if}
                </div>

                <div class="event-container">
                    {#each displayedEvents as { year, event, yOffset, yearsAgo } (event)}
                        <p class="year" style="transform: translateY({yOffset}px); transition: transform 0.3s ease;">
                            {#if yearsAgo < 11900}
                                {year}
                            {/if}
                            </p>

                        {#if yearsAgo > 11900}
                            <p class="event" style="transform: translateY({yOffset}px); transition: transform 0.3s ease; color: white; font-style: italic;">{@html event}</p>
                        {:else}
                            <p class="event" style="transform: translateY({yOffset}px); transition: transform 0.3s ease;">{@html event}</p>
                        {/if}
                    {/each}                
                </div>

            </div>

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

            <div class="chart">
                <svg width={chartWidth} height={chartHeight}>
                    <rect
                        x={0}
                        y={yScale($tweenedColumn)}
                        width={chartWidth}
                        height={chartHeight - yScale($tweenedColumn)}
                        fill="#0C584C"
                    />
                </svg>
            </div>

        </div>
    </div>

{:else}
    <p>Loading...</p>
{/if}



<style>

    :global(body) {
        font-family: "Fira Sans", serif;
        margin: 0;
    }

    .scroll-container {
        height: 5000vh;
        background-color: transparent;
    }

    .countdownContainer {
        display: flex;
        position: absolute;
        top: 40%;
        left: 50%;
        flex-wrap: wrap;
        transform: translate(-40%, 0);
        z-index: 10;
        gap: 15px;
    }

    .mini-chart {
        position: absolute;
        z-index: 10;
        margin-left: 20px;
        margin-top: 40px;
    }

    .mini-chart-temp {
        position: absolute;
        z-index: 1;
        margin-left: 20px;
        margin-top: 40px;
    }
    

    .yearsAgo {
        color: white;
        font-size: 35px;
        font-weight: 400;
        margin: 0;
    }

    .smallYears {
        font-size: 14px;
        font-weight: 200;
        margin-top: 20px;
        width: 80px;
        color: white;
        margin: 0;
    }

    .event-container {
        align-items: top;
        width: 250px;
        max-height: 40vh;
        overflow: hidden;
    }

    .spacer {
        display: block;
        height: 6px;
    }

    .year {
        color: white;
        font-weight: 500;
        margin: 5px 0 0 0;
    }

    .event {
        white-space: pre-line;
        color: white;
        font-size: 14px;
        transition: transform 1ms ease;
        margin: 5px 0 0 0;
    }

    .bg {
        position: absolute;
        text-align: center;
        z-index: 0;
    }

    .container {
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        position: fixed;
        right: 0;
        left: 0;
        background-color: transparent;

    }

    .temp-label {
        position: absolute;
        text-align: right;
        z-index: 1;
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
        width: 130px;
    }

    .chart {
        z-index: 1;
    }

</style>