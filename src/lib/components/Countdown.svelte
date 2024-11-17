<script>
    import * as d3 from 'd3';
    export let yearsAgo;
    export let currentIndex;
    export let displayedEvents;

$: currentYear = yearsAgo[currentIndex]

</script>

<div class="countdown-container">

    <div class="countdown">
        {#if currentYear > 12000}
            <p class="years-ago">{d3.format(".1f")(currentYear/1000000000)}<p class="small-years">billion of years ago</p>
        {:else}
            <p class="years-ago">{d3.format(",")(currentYear)}<p class="small-years">years ago</p>
        {/if}
    </div>

    <div class="event-container">
        {#each displayedEvents as { year, event, yOffset, yAgo } (event)}
            {#if yAgo < 11900}
                <p class="year" style="transform: translateY({yOffset}px);">{year}</p>
                <p class="event" style="transform: translateY({yOffset}px);">{@html event}</p>
            {:else}
                <p class="event" style="transform: translateY({yOffset}px); font-style: italic;">{@html event}</p>
            {/if}
        {/each}                
    </div>

</div>

<style>

.countdown-container {
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

    .years-ago {
        color: white;
        font-size: 38px;
        font-weight: 400;
        margin: 0;
    }

    .small-years {
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

    .year {
        color: white;
        font-weight: 500;
        margin: 5px 0 0 0;
        font-weight: 600;
        font-size: 16px;
        transition: transform 0.3s ease;

    }

    .event {
        white-space: pre-line;
        color: white;
        font-size: 14px;
        margin: 5px 0 0 0;
        transition: transform 1ms ease;
        color: white; 
    }

</style>