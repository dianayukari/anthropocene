<script>

    export let number;
    export let isActive = false
    
    let currentCount = number;

    $: if (isActive && currentCount < 1200) {
        const timer = setInterval(() => {
            currentCount--;
            if(currentCount <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        clearInterval(timer);
    }
    


</script>

<div>
    {currentCount}
</div>