import { createContext } from "vm";
export function gameLoop () {
    requestAnimationFrame(draw);

    // gameLoop();
}

function draw () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}