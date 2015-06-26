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

    var btAdd = gamejs.image.load('./img/btnadd.png');
    // create image masks from surface

    var mBtAdd = new pixelcollision.Mask(btAdd);
    

    var btAddPos = [30,30];
    var font = new gamejs.font.Font('20px monospace');
    var dragging = false;
	var geoDrag;
    var lastMousePos = [];
    var geos = [];
    var tipos = []
	
	
	var fusoes = [];
	
	fusoes [0] = 'a';
	
	
	
	
    /**
     * tipos geometricos
     */
    function Tipo(nome, img) {
        this.nome = nome;
        this.img = gamejs.image.load(img);
    }

    /**
     * formas geometricas
     */
    function Geo(x, y, tipo) {
        this.x = x;
        this.y = y;
        this.tipo = tipo;
		
		this.posCollideRect = function(pos){
			
			// Creates a retctangle at image position and size
			var rect = new gamejs.Rect([this.x, this.y], this.tipo.img.getSize());
			
			// If mouse is inside rect
			if (rect.collidePoint(pos)) {
				return true;
			}else{
				return false;
			}
			
		}
		
		this.posCollideMask = function(pos){
			// If the pos is inside the rect
			if(this.posCollideRect(pos)){
				// Calc mouse relative position to image
				var relative = $v.subtract(pos, [this.x, this.y]);
				// If the mask haves active pixel at position
				if ((new pixelcollision.Mask(this.tipo.img)).getAt(relative[0], relative[1])) {
					return true;
				}else{
					// If does not collides the mask
					return false;
				}
			}else{
				// If isn't inside the rect
				return false;
			}
		}
        
    }

    tipos[0] = new Tipo("novo",'./geos/tri.png');
    
    
    gamejs.event.onMouseDown(function (event) {
		var StopBreak = {};
		
		try{
			//geos.forEach(function(geo, i){
			for(var i = geos.length-1 ; i>= 0; i--){
				// If the first geo collides the cursor
				if(geos[i].posCollideMask(event.pos)){
					dragging = true;
					lastMousePos = event.pos;
					geoDrag = i;
					throw StopBreak;
				}else{
					dragging = false;
				}
			};
		}
		catch(e){
		}
		
		// Event Button add On click
        var buttonAdd = new gamejs.Rect([btAddPos[0],btAddPos[1]],btAdd.getSize());
        if (buttonAdd.collidePoint(event.pos)){
            var relative = $v.subtract(event.pos, [btAddPos[0],btAddPos[1]]);
            if (mBtAdd.getAt(relative[0],relative[1])){
               geos[geos.length] = new Geo(Math.floor(Math.random()*50),Math.floor(Math.random()*50),tipos[0]);
            }
        }
    });
    
    gamejs.event.onMouseUp(function (event) {
        dragging = false;
    });

    gamejs.event.onMouseMotion(function (event) {
        if (dragging) {
			console.log("esta arrastando");
            if ((event.pos[0] !== lastMousePos[0]) || (event.pos[1] !== lastMousePos[1])) {
                geos[geoDrag].x += event.pos[0] - lastMousePos[0];
                geos[geoDrag].y += event.pos[1] - lastMousePos[1];
            }
            lastMousePos = event.pos;
        }
    });


    gamejs.onTick(function () {
        // Limpa a tela
        display.clear();
		
		// Pinta o fundo na tela
		gamejs.graphics.rect(display, "#eeeefc", (new gamejs.Rect([0, 0], display.getSize())));
		
		// Para cara geos, pinta na sua posição
        geos.forEach(function (a, i){
            display.blit(a.tipo.img, [a.x,a.y]);
        });
		
		// Pinta as bordas que ficam acima das formas
		var bSize = 4;
		gamejs.graphics.rect(display, "#cecedc", (new gamejs.Rect([bSize, bSize], [display.getSize()[0]-2*bSize,display.getSize()[1]-2*bSize])), 2*bSize);
		
		// Mostra o botão de adicionar
        display.blit(btAdd, btAddPos);
		
		// Se está segurando alguma forma, mostra um texto
        if (dragging) {
            display.blit(font.render("Dragging the image", '#ff0000'), [300, 20]);
        }
    });
}
;

gamejs.preload([
    './geos/tri.png',
    './img/btnadd.png'
]);
gamejs.ready(main);
