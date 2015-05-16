(function() {
  var painting = false;
  var lastFrame = false;
  function CreatePaint(selector) {

    var canvas = document.querySelector(selector);
    var ctx = canvas.getContext('2d');
    
    
    var sketch = canvas.parentElement;
    var sketch_style = getComputedStyle(sketch);
    canvas.width = parseInt(sketch_style.getPropertyValue('width'));
    canvas.height = parseInt(sketch_style.getPropertyValue('height'));

    ctx.rect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#fff";
    ctx.fill();

    var mouse = {x: 0, y: 0};
     
    /* Mouse Capturing Work */
    canvas.addEventListener('mousemove', function(e) {
      mouse.x = e.pageX - this.offsetLeft;
      mouse.y = e.pageY - this.offsetTop;
    }, false);
    
    /* Drawing on Paint App */
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'blue';
     
    canvas.addEventListener('mousedown', function(e) {
      ctx.beginPath();
      painting = true;
      ctx.moveTo(mouse.x, mouse.y);
   
      canvas.addEventListener('mousemove', onPaint, false);
    }, false);
     
    canvas.addEventListener('mouseup', function() {
      painting = false;
      lastFrame = true;
      canvas.removeEventListener('mousemove', onPaint, false);
    }, false);
     
    var onPaint = function() {
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    };
  }
  function CreateCopier(canvas, card) {
    canvas = document.querySelector(canvas);
    card = document.querySelector(card);
    var lastFrameCounterMax = 10;
    var lastFrameCounter = 0;
    var quality, data;
    setInterval(function() {
      if (painting || lastFrame) {
        data = false;
        if (painting || (lastFrame && lastFrameCounter == 0)) {
          lastFrameCounter = 0;
          var canvasCopy = document.createElement("canvas");
          canvasCopy.width = canvas.width/2;
          canvasCopy.height = canvas.height/2;
          var copyContext = canvasCopy.getContext("2d");
          copyContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvasCopy.width, canvasCopy.height);
          data = canvasCopy.toDataURL('image/jpeg', 0.5);
        }
        if (lastFrame && lastFrameCounter >= lastFrameCounterMax) {
          lastFrameCounter = 0;
          lastFrame = false;
          data = canvas.toDataURL('image/jpeg', 0.8);
        }
        else if (lastFrame) {
          lastFrameCounter++;
        }
        if (data) {
          card.setAttribute('src', data);
          console.log(data.length * 2 / 1024 + "kb");
        }
      }
    },300);
  }
  CreatePaint("#paint");
  CreateCopier("#paint", "#card");
}());
