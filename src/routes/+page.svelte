<script>

    import {onMount} from 'svelte';
    import * as d3 from 'd3';
	import Background from '$lib/components/Background.svelte';
	import ColumnChart from '../lib/components/ColumnChart.svelte';
	import InfoPage from '../lib/components/InfoPage.svelte';

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

    let showModal = false
    let dataReady = false

    onMount(async() => {

        window.onbeforeunload = function () {
            window.scrollTo(0, 0);
        }

        data = await d3.csv("/timeline.csv");

        forestPct = data.map(d => +d.pct * 100);
        temp = data.map(d => +d.temp);
        tempStart = temp.slice(44, temp.length)

        countdownNumbers = data.map(d => d.years_ago);
        year = data.map(d => d.year);
        yearsAgo = data.map(d => +d.years_ago);
        label = data.map(d => d.event.replaceAll(";", `;<span class="spacer" style="display: block; height: 10px;"></span>`));
        pauseIndices = data.filter(d => d.event !== "NA").map(d => d.years_ago)

        totalScrolls = countdownNumbers.length + (pauseIndices.length*pauseScrolls)

        chartHeight = window.innerHeight - 40
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

    }

    function toggleModal() {
        showModal = !showModal
    }


</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet">
</svelte:head>

<svelte:window on:scroll={handleScroll}/>

{#if dataReady}

    <div class="scroll-container" style="--total-scrolls: {totalScrolls}">

        <div class="container">

            <!-- {#if yearsAgo[currentIndex] < 13000}
                  
                {#if yearsAgo[currentIndex] > 1000}

                    {#key column}
                        <div class="forest-container" style="top: {forestLabelTop};">
                            <p class="forest-label">{formatNumber(column*100)}% <span class="explainer">forest cover</span> </p>
                            <div class="mini-chart">
                                <svg width={100} height={60}>
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
                        <p class="temp-label" style="top: 3px;">{formatNumber(bg)}ºC <span class="explainer"> temperature</span></p>
                        <div class="mini-chart-temp">
                            <svg width={100} height={60}>
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
                    



                <div class="temp-container">
                    <p class="temp-label">{formatNumber(bg)}ºC</p>
                    <div class="mini-chart-temp">
                        <svg width={100} height={60}>
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



            {/if} -->



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

            <Background 
                width={chartWidth} 
                height={chartHeight} 
                temperature={temp} 
                {currentIndex}/>

            <ColumnChart
                width={chartWidth}
                height={chartHeight}
                forest={forestPct}
                currentIndex={currentIndex}
            />

            <button on:click={toggleModal} class="modal-btn">i</button>

            {#if showModal}
                <InfoPage
                    closeModal={toggleModal}
                />
            {/if}

        </div>
    
    </div>

{:else}
    <p>Loading...</p>
{/if}



<style>

    :global(body) {
        font-family: "Lora", serif;
        margin: 0;
    }

    :global(svg) {
        overflow: visible;
    }

    .scroll-container {
        height: 5000vh;
        background-color: transparent;
    }

    .countdownContainer {
        display: flex;
        position: absolute;
        top: 35%;
        left: 50%;
        flex-wrap: wrap;
        transform: translate(-40%, 0);
        z-index: 10;
        gap: 25px;
    }

    .countdown {
        width: 100px;
    }

    .yearsAgo {
        color: white;
        font-size: 38px;
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
        width: 200px;
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
        font-weight: 600;
        font-size: 16px;
    }

    .event {
        white-space: pre-line;
        color: white;
        font-size: 14px;
        transition: transform 1ms ease;
        margin: 5px 0 0 0;
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

    .explainer {
        font-size: 12px;
        font-weight: 200;
    }

    .modal-btn {
        position: absolute;
        bottom: 10%;
        left: 50%;
        transform: translate(-50%, 0);
        background-color: transparent;
        color: white;
        padding: 5px 12px;
        border: solid 2px white;
        border-radius: 50%;
        font-weight: 600;
        cursor: pointer;
        z-index: 100;
    }



</style>