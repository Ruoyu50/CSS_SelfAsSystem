window.setup = function() {
    console.log("setup 执行了");
    createCanvas(400, 400).parent("canvas-container");
    background(200);
};

window.draw = function() {
    ellipse(width/2, height/2, 50);
};