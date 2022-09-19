

// Helper Utilities
function getWidth() {
    return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    );
}

// Borrow this from jQuery
const $ = function (val) {
    return document.querySelector(val)
}



// Call with await sleep(1000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export {$, sleep, getWidth}