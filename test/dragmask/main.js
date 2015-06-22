/**
 * @fileoverview
 * Demonstrates pixel perfect collision detection utilizing image masks.
 *
 * A 'img' is moved around with mouse or cursors keys - the text 'COLLISION'
 * appears if the img pixel collides with the unit.
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
    var img = gamejs.image.load('./rect.png');
    // create image masks from surface
    var mImg = new pixelcollision.Mask(img);
    var imgPosition = [90, 0];
    var font = new gamejs.font.Font('20px monospace');
    var dragging = false;
    var lastMousePos = []

    gamejs.event.onMouseDown(function (event) {
        // Creates a retctangle at image position and size
        var rect = new gamejs.Rect([imgPosition[0], imgPosition[1]], mImg.getSize());
        // If mouse is inside rect
        if (rect.collidePoint(event.pos)) {
            // Calc mouse relative position to image
            var relative = $v.subtract(event.pos, [imgPosition[0], imgPosition[1]]);
            // If the position have mask
            if (mImg.getAt(relative[0], relative[1])) {
                dragging = true;
                lastMousePos = event.pos;
                
            }else{
                // If is not inside the mask, is not dragging
                dragging = false;
            }
        }else{
            // If mouse is note inside rect, is not dragging
            dragging = false;
        }
        
    });

    gamejs.event.onMouseUp(function (event) {
        dragging = false;
    });

    gamejs.event.onMouseMotion(function (event) {
        if (dragging) {
            if ((event.pos[0] !== lastMousePos[0]) || (event.pos[1] !== lastMousePos[1])) {
                imgPosition[0] += event.pos[0] - lastMousePos[0];
                imgPosition[1] += event.pos[1] - lastMousePos[1];
            }
            lastMousePos = event.pos;
        }
    });


    gamejs.onTick(function () {
        // draw
        display.clear();
        display.blit(img, imgPosition);
        if (dragging) {
            display.blit(font.render("Dragging the image", '#ff0000'), [300, 20]);
        }
    });
}
;

gamejs.preload([
    './rect.png'
]);
gamejs.ready(main);
