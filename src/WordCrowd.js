function WordCrowd(options){
	var svg,
	text,
	fonts_option = {},
	overcolor,
	container,
	defaultcolor,
	width,
	height,
	data,
	max_tries,
	colors,
	background,
	font_families,
	angles,
	self = this;
	self.setOptions = function(options){

		container = options.container;
		width     = options.width;
		height    = options.height;
		data      = options.data;
		max_tries = options.max_tries;
		background = options.background;
		font_families = options.font_families;
		colors    =options.colors;
		max_rotate_size = options.max_rotate_size;
		angles = options.angles;
		fonts_option = options.fonts;
		overcolor = options.over_color;
		//.self.init(options);


	};

	self.init = function(options){
		self.setOptions(options);
		self.setSvg();
		self.addLabels();
		self.addAttr();
		self.setStyle();
		self.setText();
	};

	self.setSvg = function(){
		svg = d3.select(container)
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("background",background)
		.on("dblclick", function(){ self.redraw();

		});

	};

	self.addLabels = function(){

		text = svg.selectAll(".place-label")
		.data(data)
		.enter().append("text");


	};	

	self.addAttr = function(){
		text.attr("class", "place-label")
		.attr("font-family", function(d){ return (font_families.length >1)? self.getRandom(font_families): font_families;})
		.on("click", function(d){
			alert(d.word);
		})
		.on("mouseover", function(d){
    		defaultcolor = d.color;
    		d3.select(this).style("fill" , overcolor);
    		
		})
		.on("mouseout", function(d){
				d3.select(this).style("fill" , defaultcolor);
		})
		;


	};

	self.setStyle = function(){

		text.style("font-size", function(d){

			if(d.size < fonts_option.min){
				return fonts_option.min;
			}else if(d.size>fonts_option.max){
				return fonts_option.max;
			}
			else{
				return d.size;
			}
		})

		.style("fill", function(d){
			var textColor;
            if(colors = "random"){
                 textColor = self.getRandomColor();
            }else{
            	textColor = colors;
            }
            d.color = textColor;
            return textColor;
			// return (colors == "random")? self.getRandomColor() : colors;});
             });
	};

	self.setText = function(){

		text.text(function(d) { return d.word; })

		.each(function(d, i){

			self.move(this);
			var tried = 0;
			while(self.is_collide(this)){
				if(tried > max_tries){
					this.remove();
					break;
				}
				d3.select(this).attr("transform", function(d , i){
					getword = d.word;
					wordLength =  getword.length;
					console.log("word : "+ getword + " , length : "+wordLength);
					if(wordLength > 10){
						angle = "rotate(0)";
					}else{
						angle = "rotate("+self.getRandom(angles)+")";
					}
						// return (d.size < max_rotate_size) && (tried%4 == 0) ? "rotate(270)" : "rotate(0)";
						return angle;
						
					});
				self.move(this);
				tried++;
			}
		});

	};

	self.redraw = function(){
		svg.remove();
		self.setOptions(options);
	};


	self.getRandom = function(givenArray){

		return givenArray[Math.floor(Math.random()*givenArray.length)];		
	};
	self.getRandomColor = function() {
		letters = '0123456789ABCDEF'.split('');
		color = '#';
		for ( i = 0; i < 6; i++ ) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	};

	self.getNextCoordinates = function(word){

		var z = new Ziggurat();

		var a = word.getBoundingClientRect();

				var fieldWidth = width;//canvas.width;
				var fieldHeight = height;//canvas.height;
				var centerHorizLine =  ((fieldHeight - a.height) * 0.5);//450*.5
				var  centerVertLine =  ((fieldWidth - a.width) * 0.5);

				var  xOff =  z.nextGaussian() * ((fieldWidth - a.width) *0.2);
				var  yOff =  z.nextGaussian() * 50;
				return [centerVertLine + xOff, centerHorizLine + yOff];
			};
			
			self.is_collide = function(that){

				var DO_NOTHING = false;
				var COLLIDED = false;
				var a = that.getBoundingClientRect();
				svg.selectAll(".place-label")
				.each(function(d, i) {
					if(DO_NOTHING || COLLIDED || this == that) {
						DO_NOTHING = true;
					}else{
						var b = this.getBoundingClientRect();
						if(self.collide(a, b)){
							COLLIDED =  true;
						}
					}
				});
				
				return COLLIDED;
			};
			self.move = function(word){
				var gaussians = self.getNextCoordinates(word);
				//. check if the word is drawn out of the container
				var right_pos = width - (word.getBoundingClientRect().width + 12);
				while(gaussians[0] < 12 || gaussians[0] > right_pos){
					gaussians = self.getNextCoordinates(word);
				}
				
				var to = d3.transform(d3.select(word).attr("transform"));
				to.translate = [ gaussians[0], gaussians[1] ];
				d3.select(word).attr("transform", "translate(" + to.translate + ")rotate("+to.rotate+")");
			};

			self.collide = function(a, b){
				return !(
					((a.top + a.height) < (b.top)) ||
					(a.top > (b.top + b.height)) ||
					((a.left + a.width) < b.left) ||
					(a.left > (b.left + b.width))
					);  
			};
			
			
			//. initialize WordCrowd
			self.init(options);

		}