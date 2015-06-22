/**
 * @fileoverview
 * Demonstrates pixel perfect collision detection utilizing image masks.
 *
 * A 'spear' is moved around with mouse or cursors keys - the text 'COLLISION'
 * appears if the spear pixel collides with the unit.
 *
 * gamejs.mask.fromSurface is used to create two pixel masks
 * that do the actual collision detection.
 *
 */
var gamejs = require('gamejs');
var pixelcollision = require('gamejs/pixelcollision');
var $v = require('gamejs/math/vectors');


function main() {

   var display = gamejs.display.getSurface();
   console.log(display.getRect().width);
   var spear = gamejs.image.load('./spear.png');
   var unit = gamejs.image.load('./unit.png');

   // create image masks from surface
   var mUnit = new pixelcollision.Mask(unit);
   var mSpear = new pixelcollision.Mask(spear);

   function Seta(x,y){
   		this.x = x;
   		this.y = y;
   }

   // cria as setas (um vetor de Seta)
   var setas = [];
   setas[0] = new Seta(90, 130);
   setas[1] = new Seta(20, 190);
   

   var unitPosition = [20, 20];
   var spearPosition = [6, 0];

   var font = new gamejs.font.Font('20px monospace');

   var direction = {};
   direction[gamejs.event.K_UP] = [0, -1];
   direction[gamejs.event.K_DOWN] = [0, 1];
   direction[gamejs.event.K_LEFT] = [-1, 0];
   direction[gamejs.event.K_RIGHT] = [1, 0];
   
   gamejs.event.onKeyUp(function(event) {

   });
   gamejs.event.onKeyDown(function(event) {
      var delta = direction[event.key];
      if (delta) {
         spearPosition = $v.add(spearPosition, delta);
      }
   });

   gamejs.event.onMouseMotion(function(event) {
      if (display.rect.collidePoint(event.pos)) {
      	var spear2 = $v.divide(spear.getSize(),2);
         spearPosition = $v.subtract(event.pos, spear2);
         console.log("mouse se moveu");
             console.log(typeof event.button);
         if(event.button === 1){
                console.log("ok");
         }
           spearPosition = $v.subtract(event.pos, spear.getSize());
      }
   });
   
   gamejs.event.onMouseDown(function (event) {
       if (event){
          
       }
   });

    gamejs.event.onMouseUp(function (event) {
       if (event){
          
       }
   });

   gamejs.onTick(function() {
      // draw
      display.clear();
      for (var i = 0; i < setas.length; i++) {
      	setas[i].x += 1;
      	display.blit(spear, [setas[i].x,setas[i].y]);

      };
      display.blit(unit, unitPosition);
      display.blit(spear, spearPosition);
      // collision
      // the relative offset is automatically calculated by
      // the higher-level gamejs.sprite.collideMask(spriteA, spriteB)
      var relativeOffset = $v.subtract(spearPosition, unitPosition);
      var hasMaskOverlap = mUnit.overlap(mSpear, relativeOffset);
      if (hasMaskOverlap) {
         display.blit(font.render('COLLISION', '#ff0000'), [250, 50]);
      }
   });
};

gamejs.preload([
   './spear.png',
   './unit.png'
]);
gamejs.ready(main);
