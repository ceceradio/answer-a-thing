'use strict';

angular.module('answerAThingApp')
  .directive('drawboard', function () {
    return {
      restrict: 'E',
      scope: {
        onSubmit: '@'
      },
      templateUrl: '/components/drawboard/drawboard.html',
      controller: function($scope) {
        $scope.painting = false;
        $scope.lastFrame = true;
      },
      link: function(scope, element, attr) {
        var cumulativeOffset = function(element) {
          var top = 0, left = 0;
          do {
              top += element.offsetTop  || 0;
              left += element.offsetLeft || 0;
              element = element.offsetParent;
          } while(element);

          return {
              top: top,
              left: left
          };
      };

        var canvas = element[0].querySelector("canvas");
        var row = element[0].querySelector(".row");

        var ctx = canvas.getContext('2d');

        var row_style = getComputedStyle(row, null);
        canvas.width = parseInt(row_style.getPropertyValue('width').replace(/[^-\d\.]/g, ''));
        canvas.height = parseInt(row_style.getPropertyValue('width').replace(/[^-\d\.]/g, '') * 9 / 16);

        scope.clear = function() {
          ctx.fillStyle="#ffffff";
          ctx.fillRect(0,0,canvas.width,canvas.height);
        }
        scope.clear();

        var mouse = {x: 0, y: 0};
         
        /* Mouse Capturing Work */
        canvas.addEventListener('mousemove', function(e) {
          mouse.x = e.pageX - cumulativeOffset(canvas).left;
          mouse.y = e.pageY - cumulativeOffset(canvas).top;
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