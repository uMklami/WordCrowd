function wordFrequency (stringLine) {
	
   stringLine = stringLine.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
   
   stringLine = stringLine.removeStopWords();
   words = stringLine.split(/\s/);
   freqMap = {};
   data = [];
   words.forEach(function(w) {
		if (!freqMap[w]) {
			freqMap[w] = 0;
		}
		freqMap[w] += 1;
	});
	 for (var key in freqMap) {
		//console.log("key : "+ key + ", value :" + freqMap[key]);
		data.push({"word":key , "size":freqMap[key]});
	 }
	return data;
}

var WordCrowd = function (options){
	
	var svg,
	defaultcolor,
	self = this;
	
	var settings = {
		container:"body",
		data : text,
		width:800,
		fontsize_range : {
			min : 20,
			max : 40
		},
		hover_color :"grey",
		height:600,
		max_tries:700,
		max_rotate_size:30,
		angles : [0,90], // angles should be between 0 and 360
		colors:"random",
		background :"white",
		font_families:[ "Arial Bold Italic", "Verdana", "Helvetica" ,"Monaco", "monospace" , "Bold Italic" , "Lao UI Bold" , "Bodoni MT Black Italic"],
			
	};
	
	//. override default settings...
	if (typeof options != 'undefined') {
      for (var prop in options) {
        if (prop in settings) {
          settings[prop] = options[prop];
        }
      }
    }
	
	settings.data = wordFrequency(settings.data);
	
	self.init = function(options){
		
		svg = d3.select(settings.container)
				.append("svg")
				.attr("width", settings.width)
				.attr("height", settings.height)
				.style("background",settings.background)
				.on("dblclick", function(){ self.redraw();
			});
			
		var label = svg.selectAll(".place-label")
				.data(settings.data)
				.enter().append("text");
		
		label.attr("class", "place-label")
			.attr("font-family", function(d){ return (settings.font_families.length > 1) ? self.getRandom(settings.font_families): settings.font_families;})
			.on("click", function(d){
				console.log(d.word);
			})
			.on("mouseover", function(d){
				defaultcolor = d.color;
				d3.select(this).style("fill" , settings.hover_color);
			})
			.on("mouseout", function(d){
					d3.select(this).style("fill" , defaultcolor);
			});

		label.style("font-size", function(d){
			var font_size = d.size;
			if(font_size < settings.fontsize_range.min){
				font_size = settings.fontsize_range.min;
			}else if(font_size > settings.fontsize_range.max){
				font_size = settings.fontsize_range.max;
			}
			return font_size;
		})
		.style("fill", function(d){
			d.color = settings.colors;
            if(settings.colors == "random"){
                 d.color = self.getRandomColor();
            }
            return d.color;
         });
		
		label.text(function(d) { return d.word; })
		.each(function(d, i){

			self.move(this);
			var tried = 0;
			while(self.is_collide(this)){
				if(tried > settings.max_tries){
					this.remove();
					break;
				}
				d3.select(this).attr("transform", function(d , i){
						return d.word.length  > 10 ? "rotate(0)" : "rotate("+self.getRandom(settings.angles)+")";
				});
				self.move(this);
				tried++;
			}
		});
	};

	self.redraw = function(){
		svg.remove();
		self.init();
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

		var fieldWidth = settings.width;//canvas.width;
		var fieldHeight = settings.height;//canvas.height;
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
		var right_pos = settings.width - (word.getBoundingClientRect().width + 12);
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
	self.init();

}