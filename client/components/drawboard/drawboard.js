'use strict';

angular.module('answerAThingApp')
  .directive('drawboard', function () {
    return {
      restrict: 'E',
      scope: {
        width: '=',
        height: '='
      },
      templateUrl: '/components/drawboard/drawboard.html',
      controller: function($scope) {
        $scope.painting = false;
        $scope.lastFrame = true;
      },
      link: function(scope, element, attr) {
        var canvas = element[0].children[0];

        var ctx = canvas.getContext('2d');
    
        var sketch = canvas.parentElement;
        var sketch_style = getComputedStyle(sketch);
        canvas.width = parseInt(scope.width);
        canvas.height = parseInt(scope.height);

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
          scope.painting = true;
          ctx.moveTo(mouse.x, mouse.y);
       
          canvas.addEventListener('mousemove', onPaint, false);
        }, false);
         
        canvas.addEventListener('mouseup', function() {
          scope.painting = false;
          scope.lastFrame = true;
          canvas.removeEventListener('mousemove', onPaint, false);
        }, false);
         
        var onPaint = function() {
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        };
      }

    }
  });