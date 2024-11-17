<script>

    import {fade} from 'svelte/transition';

    export let closeModal;

</script>

<div class="modal-overlay" transition:fade>

    <p class="modal-title">Title</p>
    <p class="modal-content">content</p>

    <button on:click={closeModal} class="modal-close">x</button>

</div>

<style>

    .modal-overlay {
        position: fixed;
        top: 5%;
        left: 50%;
        width: 85%;
        height: 85%;
        transform: translate(-50%, 0);
        background: white;
        justify-content: center;
        align-items: center;
        z-index: 100;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    }

    .modal-title {
        font-size: 20px;
        color: white;
    }

    .modal-content {
        font-size: 16px;
        color: white;
    }

    .modal-close {
        position: absolute;
        bottom: 5%;
        left: 50%;
        transform: translate(-50%, 0);
        background-color: white;
        color: black;
        padding: 5px 10px;
        border: solid 1px black;
        border-radius: 50%;
        font-weight: 600;
        cursor: pointer;
        z-index: 100;
    }
</style>