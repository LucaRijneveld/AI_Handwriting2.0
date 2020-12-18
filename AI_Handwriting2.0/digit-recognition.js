let model;

var canvasWidth = 150;
var canvasHeight = 150;
var canvasStrokeStyle = "white";
var canvasLineJoin = "round";
var canvasLineWidth = 10;
var canvasBackgroundColor = "black";
var canvasId = "canvas";
var clickX = new Array();
var clickY = new Array();
var clickD = new Array();
var drawing;

document.getElementById('chart_box').innerHTML = "";
document.getElementById('chart_box').style.display = "none";

var canvasBox = document.getElementById('canvas_box');
var canvas = document.createElement("canvas");

canvas.setAttribute("width", canvasWidth);
canvas.setAttribute("height", canvasHeight);
canvas.setAttribute("id", canvasId);
canvas.style.backgroundColor = canvasBackgroundColor;
canvasBox.appendChild(canvas);
if(typeof G_vmlCanvasManager != 'undefined'){
    canvas = G_vmlCanvasManager.initElement(canvas);
}

ctx = canvas.getContext("2d");

// Start function voor muis en vinger
$("#canvas").mousedown(function(e) {
    var rect = canvas.getBoundingClientRect();
    var mouseX = e.clientX- rect.left;;
    var mouseY = e.clientY- rect.top;
    drawing = true;
    addUserGesture(mouseX, mouseY);
    drawOnCanvas();
});

canvas.addEventListener("touchstart", function(e) {
    if(e.target == canvas) {
        e.preventDefault();
    }

    var rect = canvas.getBoundingClientRect();
    var touch = e.touches[0];

    var mouseX = touch.clientX - rect.left;
    var mouseY = touch.clientY - rect.top;

    drawing = true;
    addUserGesture(mouseX, mouseY);
    drawOnCanvas();
}, false);

//Bewegins functies
$("#canvas").mousemove(function(e) {
    if(drawing) {
        var rect = canvas.getBoundingClientRect();
        var mouseX = e.clientX- rect.left();;
        var mouseY = e.clientY- rect.top();
        addUserGesture(mouseX, mouseY, true);
        drawOnCanvas();
    }
});

canvas.addEventListener("touchmove", function(e)){
    if(e.target == canvas){
        e.preventDefault();
    }
    if(drawing){
        var rect = canvas.getBoundingClientRect();
        var touch = e.touches[0];

        var mouseX = touch.clientX - rect.left;
        var mouseY = touch.clientY - rect.top;

        addUserGesture(mouseX, mouseY, true);
        drawOnCanvas();
    }
}, false);

//Stop functies
$("#canvas").mouseup(function(e){
    drawing = false;
});

canvas.addEventListener("touchend", function(e)) {
    if (e.target == canvas){
        e.preventDefault();
    }
    drawing = false;
}, false);

//Verlaat functies
$("#canvas").mouseleave(function(e) {
    drawing = false;
});

canvas.addEventListener("toucheleave", function(e)){
    if(e.target == canvas) {
        e.preventDefault();
    }
    drawing = false;
}, false);

//Voeg klik toe functie
function addUserGesture(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickD.push(dragging);
}

//RE teken functie
function drawOnCanvas(){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = canvasStrokeStyle;
    ctx.lineJoin = canvasLineJoin;
    ctx.lineWidth = canvasLineWidth;

    for (var i = 0, i < clickX.length; i++) {
        ctx.beginPath();
        if(clickD[i] && i) {
            ctx.moveTo(clickX[i-1], clickY[i-1]);
    } else {
        ctx.moveTo(clickX[i]-1, clickY[i]);
    }
    ctx.lineTo(clickX[i], clickY[i]);
    ctx.closePath();
    ctx.stroke();
  }
}

//Clear Canvas functie
$("#clear-button").click(async function (){
    ctx.clearRect(0, o, canvasWidth, canvasHeight);
    clickX = new Array();
    clickY = new Array();
    clickD = new Array();
    $(".prediction-text").empty();
    %("#result_box").addClass('d-none');
});

//lader voor cnn model
async function loadModel() {
    console.log("model loading...");
    model = undefined;
    model = await tf.loadLayerModel("models/model.json");
    console.log("model loaded...");
}

loadModel();

//verwerk het canvas
function preprocessCanvas(image) {
    let tensor = tf.browser.fromPixel(image)
        .resizeNearestNeighbor([28, 28])
        .mean(2)
        .expandDims(2)
        .expandDims()
        .toFloat();
     console.log(tensor.shape);
     return tensor.div(255.0);
}

//predict function
$("#predict-button").click(async function(){
    var imageData = canvas.toDataURL();
    let tensor = preprocessCanvas(canvas);
    let predictions = await model.predict(tensor).data();
    let results = Array.from(predictions);

    $("#result_box").removeClass('d-none');
    displayChart(results);
    displayLabel(results);

    console.log(results);
}

//chart naar display predictions
var chart = "";
var firstTime = 0;
function loadChart(label, data, modelSelected){
    var ctx = documet.getElementById('chart_box').getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',

        data:{
            labels: label,
            datasets: [{
                label: modelSelected + "prediction",
                backgroundColor: '#f50057',
                borderColor: 'rgb(255, 99, 132',
                data: data,
            }]
        },

        options:{}
    });
}
//display chart met updated tekening canvas
function displayChart(data) {
    var selected_model = document.getElementById("selected_model");
    var selected_option = "CNN";

    label = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    if(firstTime == 0){
        loadChart(label, data, selected_option);
        firstTime = 1;
    } else{
        chart.destroy();
        loadChart(label, data, selected_option);
    }
    document.getElementById('chart_box').style.display = "block";
}

function displayLabel(data) {
    var max = data[0];
    var maxIndex = 0;

    for(var i = 1; 1 < data.length; i++){
        if (data[i] > max){
            maxIndex = i;
            max = data[i];
        }
    }
    $(".prediction-text").html("Predicting your draw <b>" +maxIndex"</b> with <b>"+Math.trunc(max*100)+"%</b> confidence")
}
