<script>

    import {onMount} from 'svelte';
    import * as d3 from 'd3';
	import Background from '$lib/components/Background.svelte';
	import ColumnChart from '../lib/components/ColumnChart.svelte';
	import InfoPage from '../lib/components/InfoPage.svelte';
	import Countdown from '../lib/components/Countdown.svelte';
    import { csvPath } from '$lib/constants';

    let yearsAgo = [];
    let currentIndex = 0
    let label = []
    let year = []

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

        data = await d3.csv(csvPath);

        forestPct = data.map(d => +d.pct * 100);
        temp = data.map(d => +d.temp);
        tempStart = temp.slice(44, temp.length)

        yearsAgo = data.map(d => d.years_ago);
        year = data.map(d => d.year);
        label = data.map(d => d.event.replaceAll(";", `;<span class="spacer" style="display: block; height: 10px;"></span>`));
        pauseIndices = data.filter(d => d.event !== "NA").map(d => d.years_ago)

        totalScrolls = yearsAgo.length + (pauseIndices.length*pauseScrolls)

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
        

        for(let i = 0; i < yearsAgo.length; i++) {            

           if(pauseIndices.includes(yearsAgo[i])) {
             
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

        currentIndex = Math.min(adjustedIndex - (pauseCount * pauseScrolls), yearsAgo.length -1)
        
        const newEvent = { year: year[currentIndex], event: label[currentIndex], yAgo: yearsAgo[currentIndex]  };

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

            <Countdown
                {yearsAgo}
                {currentIndex}
                {displayedEvents}
            />

            <Background 
                width={chartWidth} 
                height={chartHeight} 
                temperature={temp} 
                {currentIndex}/>

            <ColumnChart
                width={chartWidth}
                height={chartHeight}
                forest={forestPct}
                {currentIndex}
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

    .spacer {
        display: block;
        height: 6px;
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