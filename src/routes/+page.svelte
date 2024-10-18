<script>

    import {onMount} from 'svelte';
    import * as d3 from 'd3';
    import Countdown from '../lib/components/Countdown.svelte';


    let y = 0
    let countdownNumbers = [];
    let currentIndex = 0
    let label = []

    let pauseIndices = []
    let pauseScrolls = 80
    let totalScrolls

    onMount(async() => {
        const data = await d3.csv("/timeline.csv");
        countdownNumbers = data.map(d => d.years_ago);
        label = data.map(d => d.event)
        pauseIndices = data.filter(d => d.event !== "NA").map(d => d.years_ago)

        totalScrolls = countdownNumbers.length + (pauseIndices.length*pauseScrolls)

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


</script>

<svelte:window on:scroll={handleScroll}/>

<div class="scroll-container" style="--total-scrolls: {totalScrolls}">
    
    <div class="container">
        <div class="countdown">
            {#if countdownNumbers[currentIndex]}
               <p class="yearsAgo">{countdownNumbers[currentIndex]} years ago</p>
                <p class="event">{label[currentIndex]}</p>
            {/if}
        </div>
    </div>

    <div class="chart"></div>

</div>

<style>

    .scroll-container {
        height: 8000vh;
    }


    .yearsAgo {
        text-align: center;
    }

    .event {
        /* text-align: center; */
    }

    .container {
        width: 200px;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: fixed;
        top: 50%;
        left: calc(50% - 100px);
        right: 0;
    }


</style>