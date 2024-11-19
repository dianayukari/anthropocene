<script>

    import {fade} from 'svelte/transition';

    export let closeModal;

</script>

<div class="modal-overlay" transition:fade>

    <div class="modal-content-container">

        <p class="modal-title">The Debate Over the Anthropocene</p>
        <p class="modal-content">This project explores the contested definition of the Anthropocene as a new geological epoch. It visually contrasts two perspectives: the vast timeline of Earth's history challenges the Anthropocene's significance, while a dramatic finale highlights humanity's recent, intense impact.</p>
        <p class="modal-content-title">Temperature Data </p>
        <p class="modal-content">The temperature dataset is derived from <i>Judd et al.'s "A 485 million-year history of Earth's surface temperature,"</i> which reconstructs Earth's surface temperature trends over geological time.</p>
        <p class="modal-content-title">Forest Coverage Data</p>
        <p class="modal-content">The land use data is based on the study <i>"Anthropogenic Biomes: 10,000 BCE to 2015 CE" by Ellis et al.,</i> offering a comprehensive look at human land use and its evolution. Five land categories were selected to emphasize the extent and transformation of human influence on natural landscapes: Remote woodlands, Inhabited treeless & barren lands, Wild woodlands, Wild treeless & barren lands and Ice, uninhabited</p>
        <p class="modal-content-title">Timeline of Events</p>
        <p class="modal-content">The timeline is constructed using data scraped from several Wikipedia articles: Timeline of Natural History, Timeline of Evolutionary History, List of Natural Disasters by Death Toll, Timeline of Prehistory, and 2nd Millennium.</p>
    </div>

    <div class="btn-container">
        <button on:click={closeModal} class="modal-close"></button>
    </div>

</div>

<style>

    .modal-overlay {
        position: fixed;
        top: 5%;
        left: 50%;
        width: 90%;
        max-width: 500px;
        height: 90%;
        transform: translate(-50%, 0);
        background: white;
        justify-content: center;
        align-items: center;
        z-index: 100;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
        background: radial-gradient(circle, rgba(251,254,254,1) 0%, rgba(251,230,216,1) 100%);
    }

    .modal-content-container {
        padding: 30px;
        bottom: 30px;
        overflow-y: scroll;
        height: 70%;
    }

    .modal-content-title {
        font-size: 18px;
        font-weight: 600;
        margin: 25px 0 8px 0;
    }

    .modal-title {
        font-size: 20px;
        /* color: white; */
    }

    .modal-content {
        font-size: 16px;
        margin: 0;
        /* color: white; */
    }

    .modal-close {
        position: absolute;
        bottom: 5%;
        left: 50%;
        transform: translate(-50%, 0);
        background-color: transparent;
        color: black;
        padding: 5px 10px;
        border: solid 1px black;
        border-radius: 50%;
        font-weight: 600;
        cursor: pointer;
        z-index: 100;
    }

    .modal-close::after {
        content: "\00d7";
    }

</style>