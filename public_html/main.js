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

/**
 * 
 * @param {gamejs.graphics.surfaceArray} sa
 * @param {number} brightness
 * @returns {undefined}
 */
gamejs.graphics.clarifica = function(sa, brightness){
    for(var y = 0; y < sa.getSize()[1]; y++){
        for(var x = 0; x < sa.getSize()[0]; x++){
            var color = [sa.get(x, y)[0]+brightness,sa.get(x, y)[1]+brightness, sa.get(x, y)[2]+brightness, sa.get(x, y)[3]];
            sa.set(x, y, color);
        }
    }
};

/**
 * 
 * @param {gamejs.graphics.surfaceArray} sa
 * @param {number} brightness
 * @returns {undefined}
 */
gamejs.graphics.clarificaBordas = function(sa, brightness){
    var filt = 80;
    for(var y = 0; y < sa.getSize()[1]; y++){
        for(var x = 0; x < sa.getSize()[0]; x++){
            if ((sa.get(x, y)[0]<filt)&&(sa.get(x, y)[1]<filt)&&(sa.get(x, y)[2]<filt)) {
                var color = [sa.get(x, y)[0]+brightness,sa.get(x, y)[1]+brightness, sa.get(x, y)[2]+brightness, sa.get(x, y)[3]]; 
                sa.set(x, y, color);
            }
        }
    }
};

function main() {

    var display = gamejs.display.getSurface();

    var btAdd = gamejs.image.load('./img/btnadd.png');
    // create image masks from surface

    var fieldPos = [0,0]; // The screen position
    var gridWidth = 40;

    var font = new gamejs.font.Font('20px monospace');
    var dragging = false;
    var dragObject;
	var geoDrag;
    var lastMousePos = []; // Rect, ou seja um array de 2 posições [x, y], indica a última posição do mouse no evento anterios
    var geos = [];
    var tipos = [];
    var botoes = [];
	
	
	var fusoes = [];
	
	fusoes[0] = 'a';

    // --- MODEL

    // Declara os tipos	
    tipos[0] = new Tipo("Triângulo",'./geos/tri.png');
    tipos[1] = new Tipo("Quadrado",'./geos/square.png');
    tipos[2] = new Tipo("Pentágono",'./geos/penta.png');

    // Posiciona os botões
    botoes[0] = new Botao(30, 30, './img/btnadd.png');
    botoes[1] = new Botao(110, 30, './img/btnadd.png');
    botoes[2] = new Botao(190, 30, './img/btnadd.png');
    
    /**
     * Parte Sonora
     */
    
    // O jogo pode tocar até 9 sons simultâneos
    gamejs.audio.setNumChannels(9);
    
    // Lista de sons
    var sounds = {};
    // Som de fusão
    sounds['fusion'] = new gamejs.audio.Sound('./sound/fusion.ogg');
    sounds['back'] = new gamejs.audio.Sound('./sound/backmusic.ogg');
	sounds['add'] = new gamejs.audio.Sound('./sound/add.wav');
    
    sounds['back'].play(true);
    
    /**
     * tipos geometricos
     */
    function Tipo(nome, img) {
        var me = this;
        this.nome = nome;
        this.img = gamejs.image.load(img);
        
        this.getMask = function(){
            return new pixelcollision.Mask(me.img);
        };
    }

    /**
     * formas geometricas
     */
    function Geo(x, y, tipo) {
    	var me = this; // Armazena o próprio objeto dentro de uma variável para poder ser usado dentro de métodos
        this.x = x;
        this.y = y;
        this.tipo = tipo;
        this.bright = {
            impulsion: 10,
            defaultImpulsion: 10,
            current:0,
            objective: 0,
            standard: function(){
                return this.objective === 0;
            },
            upToDate: function(){
                return this.current === this.objective;
            },
            reset: function(impulsion){
                if(impulsion) this.impulsion = impulsion;
                this.objective = 0;
            },
            update: function(){
                
                if(this.objective>this.current){
                    if(this.current+this.impulsion>this.objective){
                        if(this.objective === 0){
                            this.current = 0;
                        }else{
                            this.choose();
                        }
                    }else{
                        this.current += this.impulsion;
                    }
                }else if(this.objective<this.current){
                    if(this.current-this.impulsion<this.objective){
                        if(this.objective === 0){
                            this.current = 0;
                        }else{
                            this.choose();
                        }
                    }else{
                        this.current -= this.impulsion;
                    }
                }else{
                    if(this.objective>0){
                        this.choose();
                    }
                }
            },
            choose: function(impulsion){
                this.impulsion = (impulsion) ? impulsion:this.defaultImpulsion;
                this.objective = Math.floor(Math.random()*100)+50;
            }
        };
        
        this.relativeX = function () {
			return this.x+fieldPos[0];          
        };
        
        this.relativeY = function () {
			return this.y+fieldPos[1];          
        };
        
        this.relativePosition = function () {
        	return [me.relativeX(), me.relativeY()];
        };
		
		this.posCollideRect = function(pos){
			// Cria um retângulo na posição Relativa da imagem e com seu tamanho
			var rect = new gamejs.Rect(this.relativePosition(), this.tipo.img.getSize());
			
			// Se o mouse está deste retângulo
			if (rect.collidePoint(pos)) {
				return true;
			}else{
				return false;
			}
			
		};
		
		this.posCollideMask = function(pos){
			// Se a posição do mouse está dentro do retângulo
			if(this.posCollideRect(pos)){
				// Calcula a posição do mouse relativa à imagem
				var relative = $v.subtract(pos, this.relativePosition());
				// Se a máscara tem pixel ativo na posição
				if ((new pixelcollision.Mask(this.tipo.img)).getAt(relative[0], relative[1])) {
					return true;
				}else{
					// Se o cursor não colide com a máscara
					return false;
				}
			}else{
				// Se não está dentro do retângulo
				return false;
			}
		};
                
                /**
                 * Verifica se uma máscara dada uma distorção colide com a máscara do geo
                 * @param {gamejs.Mask} mask
                 * @param {type} offset
                 * @returns {Boolean}
                 */
                this.maskCollideMask = function(mask, offset){
                    return me.tipo.getMask().overlap(mask, offset);
		};
                
                /**
                 * Verifica se um retângulo dado uma distorção colide com a máscara
                 * @param {pixelcollision.Mask} mask
                 * @param {Array} offset
                 * @returns {Boolean}
                 */
                this.rectCollideMask = function(mask, offset){
                    return (me.tipo.getMask().overlapArea(mask, offset)>0);
		};
                
                /**
                 * Verifica se um geo colide com outro
                 * @param {main.Geo} geo
                 * @returns {Boolean}
                 */
                this.geoCollides = function(geo){
                    var posRelativa = $v.subtract(geo.relativePosition(), me.relativePosition());
                    return me.maskCollideMask(geo.tipo.getMask(), posRelativa);
                };
                
                /**
                 * Verifica se um geo colide com outro
                 * @param {main.Geo} geo
                 * @returns {Boolean}
                 */
                this.rectGeoCollides = function(geo){
                    var posRelativa = $v.subtract(geo.relativePosition(), me.relativePosition());
                    return me.rectCollideMask(geo.tipo.getMask(), posRelativa);
                };
        
    }
    
    /**
     * Classe de Botão
     * @param {number} x
     * @param {number} y
     * @param {string} img
     * @returns {main.Botao}
     */
    function Botao(x, y, img) {
    	var me = this; // Armazena o próprio objeto dentro de uma variável para poder ser usado dentro de métodos
        this.x = x;
        this.y = y;
        this.img = gamejs.image.load(img);
        
        this.position = function() {
        	return [me.x, me.y];
        };
		
		this.posCollideRect = function(pos){
			// Cria um retângulo na posição do botão
			var rect = new gamejs.Rect(this.position(),this.img.getSize());
			
			// Se o mouse está dentro deste retângulo
	        if (rect.collidePoint(pos)){
	            return true;
	        }else{
	        	return false;
	        }
		};
		
		this.posCollideMask = function(pos){
			// Se a posição do mouse está dentro do retângulo
			if(this.posCollideRect(pos)){
				// Calcula a posição do mouse relativa à imagem
				var relative = $v.subtract(pos, this.position());
				// Se a máscara tem pixel ativo na posição
				if ((new pixelcollision.Mask(this.img)).getAt(relative[0], relative[1])) {
					return true;
				}else{
					// Se o cursor não colide com a máscara
					return false;
				}
			}else{
				// Se não está dentro do retângulo
				return false;
			}
		};
                
    }

	// --- CONTROLLER
	
	// Posiciona o centro do campo no centro da tela
	fieldPos = $v.divide(display.getSize(), 3);
        
        /**
         * Verifica se uma forma colide com alguma forma da lista.
         * @param {main.Geo} geo A forma que pretende ser testada
         * @returns {Boolean}
         */
        var collideSomeGeo = function(geo){
            var BreakException = {};
            var result = false;
            try{
                geos.forEach(
                    /**
                     * @param {main.Geo} obj
                     */
                    function(obj){
                        if (obj.geoCollides(geo)){
                            result = true;
                            throw BreakException;
                        }
                    }
                );
            }catch(e){}
            return result;
        };
        
        /**
         * Retorna o primeiro geo que colide na ordem do array
         * @param {main.Geo} geo A forma que pretende ser testada
         * @returns {main.Geo} A primeira geo que colide no array
         */
        var firstGeoCollision = function(geo, func){
            var BreakException = {};
            var result;
            try{
                var clone = geos.slice(0);
                clone.sort(function(){return 1;});
                clone.forEach(
                    /**
                     * @param {main.Geo} obj
                     */
                    function(obj){
                        // Se o objeto analisado colide
                        if (obj.geoCollides(geo)){
                            // Se a função passada é uma função
                            if(typeof func === 'function'){
                                // Se o objeto encontrado não passa pela função
                                if(!func(obj)){
                                    // Continua prourando
                                    return;
                                }
                            }
                            result = obj;
                            throw BreakException;
                            
                        }
                    }
                );
            }catch(e){}
            return result;
        };
        
        /**
         * 
         * @returns {main.Geo}
         */
        var getTopGeo = function(fun){
            return firstGeoCollision(geos[geoDrag], function(g){
                // Filtra também pela função passada nessa função
                var filter;
                if(typeof(fun)==='function'){
                    filter = fun(g);
                }else{
                    // Se não passou nenhuma função, simplesmente não filtra
                    filter = true;
                }
                return g!==geos[geoDrag] && filter; // Verifica uma forma que não é a que ele está segurando
            });
        };
        
        /**
         * Verifica se uma forma colide com alguma forma da lista. A nível de Retângulo
         * @param {main.Geo} geo A forma que pretende ser testada
         * @returns {Boolean}
         */
        var collideSomeRectGeo = function(geo){
            var BreakException = {};
            var result = false;
            try{
                geos.forEach(
                    /**
                     * @param {main.Geo} obj
                     */
                    function(obj){
                        if (obj.rectGeoCollides(geo)){
                            result = true;
                            throw BreakException;
                        }
                    }
                );
            }catch(e){}
            return result;
        };
	
	function createGeo(tipo){
            
            // Variáveis responsáveis pela alteração da posição onde a forma 
            // sera testada para ser inserida em um lugar onde não tem outra 
            // forma. A ideia é que a posição a ser testada comece em um lugar 
            // e se não der certo, seja testado em outros lugares, seguindo uma
            // espiral. Esses valores colaboram para esta movimentação em espiral.
            var gran = {
                delta: 150, // O tamanho da grade do espiral, cada passo se move a essa distância
                x: 0, // A posição x
                y: 0, // A posição y
                dir: 2, // Direção DCBE[0123] (2 = Baixo)
                curStep: 0, // Passo atual, o espiral segue <lenSteps> passos antes de mudar de direção
                lenStep: 1 // O tamanho do passo, incrementa 1 ao finalizar uma esquerda ou direita
            };
            
            var xDistor = Math.floor(Math.random()*50);
            var yDistor = Math.floor(Math.random()*50);
            
            do{
		var x = xDistor - fieldPos[0] + display.getSize()[0] / 3 + gran.x * gran.delta;
		var y = yDistor - fieldPos[1] + display.getSize()[1] / 3 + gran.y * gran.delta;
                // Cria uma forma na posição
                var auxGeo = new Geo(x,y,tipo);
                
                gran.curStep += 1;
                
                switch (gran.dir) {
                    case 0:
                        gran.y -= 1;
                        if(gran.curStep >= gran.lenStep){
                            gran.curStep = 0;
                            gran.dir = 1;
                        }
                        break;
                    case 1:
                        gran.x += 1;
                        if(gran.curStep >= gran.lenStep){
                            gran.curStep = 0;
                            gran.dir = 2;
                            gran.lenStep +=1;
                        }
                        break;
                    case 2:
                        gran.y += 1;
                        if(gran.curStep >= gran.lenStep){
                            gran.curStep = 0;
                            gran.dir = 3;
                        }
                        break;
                    case 3:
                        gran.x -= 1;
                        if(gran.curStep >= gran.lenStep){
                            gran.curStep = 0;
                            gran.dir = 0;
                            gran.lenStep +=1;
                        }
                        break;
                }
                
            }while(collideSomeRectGeo(auxGeo));
            // Adiciona a forma na lista
            geos[geos.length] = auxGeo;
	}
	
        /**
         * Verifica se duas formas se fundem
         * @param {main.Geo} a
         * @param {main.Geo} b
         * @returns {Boolean}
         */
        function getFusion(a, b){
            console.log('getFusion');
            if(a.type === b.type){
                console.log('returned true');
                return true;
            }else{
                console.log('returned false');
                return false;
            }
            
        }
        
	botoes[0].onClick = function(){
		createGeo(tipos[0]);
	};
	
	botoes[1].onClick = function(){
		createGeo(tipos[1]);
	};
        
        botoes[2].onClick = function(){
		createGeo(tipos[2]);
	};
    
    gamejs.event.onMouseDown(function (event) {
		var StopBreak = {};
		var accepted = false;
		
		// Event Button add On click
		try{
			// Para cada Botão
			for(var i = botoes.length-1 ; i>= 0; i--){
				// Se mouse está sobre este botão
				if(botoes[i].posCollideMask(event.pos)){
					// O evento está aceito
					accepted = true;
					// Se o botão tem função de clique
               		if(typeof botoes[i].onClick === 'function'){
               			botoes[i].onClick();
               		}
					throw StopBreak;
				}
			};
		}
		catch(e){
		}
                
                // Se o evento não foi aceito por ninguém        
                if (!accepted) {
                    try {
                        // Para cada Geos
                        for (var i = geos.length - 1; i >= 0; i--) {
                            // Se está clicando nele
                            if (geos[i].posCollideMask(event.pos)) {
                                // Segura ele
                                dragging = true;
                                lastMousePos = event.pos;
                                dragObject = "geos";
                                // Faz com que o elemento clicado seja o primeiro da fila
                                geos = geos.sort(
                                        function (a, b) {
                                            if (a === geos[i]) {
                                                return 1;
                                            } else {
                                                return -1;
                                            }
                                        }
                                );
                                geoDrag = geos.length - 1;
                                accepted = true;
                                throw StopBreak;
                            } else {
                                dragging = false;
                            }
                        }
                        ;
                    }
                    catch (e) {
                    }
                }

		

		// Se o evento não foi aceito por ninguém        
        if(!accepted){
        	// Presume que está clicando no campo 
        	lastMousePos = event.pos;
        	dragging = true;
        	dragObject = "field";
        }
        
    });
    
    gamejs.event.onMouseUp(function (event) {
        // Se estava segurando alguma forma que funde com a que estava em cima
//        if(getFusion(geos[geoDrag], getTopGeo())){
//            
//        }

        sounds['add'].play();
        
        // Não está mais segurando nada
        dragging = false;
        
    });

    gamejs.event.onMouseMotion(function (event) {
    	// Se está arrastando alguma coisa
        if (dragging) {
			// Se está arrantando um "geos"
			if(dragObject === "geos"){
				// Se a posição do cursor mudou desde a última, move o quanto mudou
				if ((event.pos[0] !== lastMousePos[0]) || (event.pos[1] !== lastMousePos[1])) {
	                geos[geoDrag].x += event.pos[0] - lastMousePos[0];
	                geos[geoDrag].y += event.pos[1] - lastMousePos[1];
	            }	
			}
			// Se está arrantando o campo
			if(dragObject === "field"){
				// Se a posição do cursor mudou desde a última, move o quanto mudou
				if ((event.pos[0] !== lastMousePos[0]) || (event.pos[1] !== lastMousePos[1])) {
	                fieldPos[0] += event.pos[0] - lastMousePos[0];
	                fieldPos[1] += event.pos[1] - lastMousePos[1];
	            }	
			}
            // Atualiza a posição do cursor
            lastMousePos = event.pos;
        }
    });

	// --- VIEW

    gamejs.onTick(function () {
        // Limpa a tela
        display.clear();
		
		// Pinta o fundo na tela
		gamejs.graphics.rect(display, "#eeeefc", (new gamejs.Rect([0, 0], display.getSize())));
		
		// Pinta as grades
		// Linhas
		for(var i = 0; i < display.getSize()[1] / gridWidth; i++ ){
			var y = i*gridWidth+(fieldPos[1]%gridWidth);
			gamejs.graphics.line(display, "#aaaaaa", [0, y], [display.getSize()[0], y], 1);
		}
		// Colunas
		for(var i = 0; i < display.getSize()[0] / gridWidth; i++ ){
			var x = i*gridWidth+(fieldPos[0]%gridWidth);
			gamejs.graphics.line(display, "#aaaaaa", [x, 0], [x, display.getSize()[1]], 1);
		}
		
		
		// Para cara geos, pinta na sua posição mais a posição do campo
        geos.forEach(function (a, i){
            var img = a.tipo.img.clone();
            
            // Se o brilho da figura não é o brilho normal
            if((!a.bright.upToDate())||(!a.bright.standard())){
                a.bright.update();
                var sur = new gamejs.graphics.SurfaceArray(img);
                gamejs.graphics.clarifica(sur, a.bright.current);
                gamejs.graphics.blitArray(img, sur);
            }
            
            display.blit(img, [a.x + fieldPos[0],a.y + fieldPos[1]]);
        });
        
		// Pinta as bordas que ficam acima das formas
		var bSize = 4;
		gamejs.graphics.rect(display, "#cecedc", (new gamejs.Rect([bSize, bSize], [display.getSize()[0]-2*bSize,display.getSize()[1]-2*bSize])), 2*bSize);
		
		// Para cada botão, mostra
		botoes.forEach(function (a, i){
			display.blit(a.img, a.position());			
		});
		
        // Se está segurando alguma forma
        if(typeof geoDrag === 'number'){
            // Pega a forma mais alta que colide
            var topGeo = getTopGeo(function(geo){
                return (typeof(getFusion(geo, geos[geoDrag])) !== 'undefined');
            });
            // Se colide com alguma forma
            if(topGeo){
                // Se a geo a fundir não está brilhando, brilha
                if(topGeo.bright.standard()){
                    topGeo.bright.choose(10);
                }
                // Se a geo segurada não está brilhando, brilha
                if(geos[geoDrag].bright.standard()){
                    geos[geoDrag].bright.choose(10);
                }
                display.blit(font.render("Am cima de "+topGeo.tipo.nome, '#ff0000'), [300, 20]);
                // Para cada forma que não é a segurada ou a desejada, reseta o brilho
                geos.filter(function(a){
                    if((a!==topGeo)&&(a!==geos[geoDrag])){return true;}
                }).forEach(function(a){
                    a.bright.reset(40);
                });
            }else{
                // Se não colide com ninguém, cancela o brilho de todos os geos
                geos.forEach(function(a){
                    a.bright.reset(40);
                });
            }
            
        }

    });
}
;

gamejs.preload([
    './geos/tri.png',
    './geos/square.png',
    './geos/penta.png',
    './img/btnadd.png',
    // Audios
    './sound/fusion.ogg',
    './sound/backmusic.ogg',
    './sound/add.wav',
    
]);
gamejs.ready(main);
