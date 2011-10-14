/*!
CSS3 ColorPicker
Copyright (c) 2011 Craig Laparo (https://plus.google.com/114746898337682206892)
Based on Colorpicker
Copyright (c) 2007 John Dyer (http://johndyer.name)
MIT style license

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

(function($){

var PROP_NAME = 'css3colorpicker';
var mainDivId = 'css3colorpicker-div';
var colorDivClass = 'color';
var cpDiv = $('<div id="' + mainDivId + '"></div>');
cpDiv.colorDiv = $('<div id="' + mainDivId + '-color"></div>');
cpDiv.oldColorDiv = $('<div id="' + mainDivId + '-colorOld"></div>');
cpDiv.d1Div = $('<div id="' + mainDivId + '-1d"></div>');
cpDiv.d1Div.control = $('<div id="' + mainDivId + '-1dControl"></div>');
cpDiv.d1Div.colorDiv = $('<div id="' + mainDivId + '-1dColor"></div>');
cpDiv.d1Div.gradientDiv = $('<div id="' + mainDivId + '-1dGradient"></div>');
cpDiv.d2Div = $('<div id="' + mainDivId + '-2d"></div>');
cpDiv.d2Div.control = $('<div id="' + mainDivId + '-2dControl"></div>');
cpDiv.d2Div.colorDiv = $('<div id="' + mainDivId + '-2dColor"></div>');
cpDiv.d2Div.gradientDiv = $('<div id="' + mainDivId + '-2dGradient"></div>');
cpDiv.inputContainer = $('<ul id="' + mainDivId + '-inputContainer"></ul>');
cpDiv.inputs = {
	h: $('<input type="text" data-mode="h" id="' + mainDivId + '-h"/>'),
	s: $('<input type="text" data-mode="s" id="' + mainDivId + '-s"/>'),
	v: $('<input type="text" data-mode="v" id="' + mainDivId + '-v"/>'),
	r: $('<input type="text" id="' + mainDivId + '-r"/>'),
	g: $('<input type="text" id="' + mainDivId + '-g"/>'),
	b: $('<input type="text" id="' + mainDivId + '-b"/>'),
	hex: $('<input type="text" id="' + mainDivId + '-hex"/>')
}
cpDiv.append(
	$('<div></div>').append(
		cpDiv.colorDiv,
		cpDiv.oldColorDiv,
		cpDiv.d1Div.append(cpDiv.d1Div.colorDiv, cpDiv.d1Div.gradientDiv, cpDiv.d1Div.control),
		cpDiv.d2Div.append(cpDiv.d2Div.colorDiv, cpDiv.d2Div.gradientDiv, cpDiv.d2Div.control),
		cpDiv.inputContainer.append(
			$('<li>H: <span>&deg;</span></div>').append(cpDiv.inputs.h),
			$('<li>S: <span>%</span></div>').append(cpDiv.inputs.s),
			$('<li>V: <span>%</span></div>').append(cpDiv.inputs.v),
			$('<li>R: </div>').append(cpDiv.inputs.r),
			$('<li>G: </div>').append(cpDiv.inputs.g),
			$('<li>B: </div>').append(cpDiv.inputs.b),
			$('<li>#: </div>').append(cpDiv.inputs.hex)
		)
	)
);

function Colorpicker(){
	this._mainDivId = mainDivId;
	this._colorDivClass = colorDivClass;

	this._defaults = {
		showAnim: true,			// Fade in/out
		duration: 150,			// Fade duration
		color: 'FFFFFF',		// Default color
		realtime: true,			// Update instantly
		invertControls: true,	// Invert color of mouse controls based on luminance
		controlStyle: 'simple'	// Mouse control theme [simple|raised|inset]
	};
};

$.extend(Colorpicker.prototype, {
	cpDiv: cpDiv,
	mode: 'h',	// [h|s|v]
	markerClassName: 'hasColorpicker',
	controlsClassPrefix: 'controls-',
	minLum: 50,

	setDefaults: function(settings){
		extendRemove(this._defaults, settings || {});
		return this;
	},

	setMode: function(mode){
		if(['h','s','v'].indexOf(mode) >= 0){
			this.cpDiv.removeClass('mode-' + this.mode);
			this.cpDiv.addClass('mode-' + mode);
			this.mode = mode;
			$.colorpicker._updateMaps();
			$.colorpicker._updateControls();
		}
	},

	color: function(args){
		this.r = 0;
		this.g = 0;
		this.b = 0;

		this.h = 0;
		this.s = 0;
		this.v = 0;
		this.l = 0;

		this.hex = '';

		this.setRgb = function(r, g, b){
			this.r = Math.max(0, Math.min(255, parseInt(r)));
			this.g = Math.max(0, Math.min(255, parseInt(g)));
			this.b = Math.max(0, Math.min(255, parseInt(b)));

			var newHsv = $.colorpicker.rgbToHsv(this);
			this.h = newHsv.h;
			this.s = newHsv.s;
			this.v = newHsv.v;
			this.l = $.colorpicker.rgbToLum(this.r, this.g, this.b);

			this.hex = $.colorpicker.rgbToHex(this);
		};

		this.setHsv = function(h, s, v){
			this.h = Math.max(0, Math.min(360, parseInt(h)));
			this.s = Math.max(0, Math.min(100, parseInt(s)));
			this.v = Math.max(0, Math.min(100, parseInt(v)));

			var newRgb = $.colorpicker.hsvToRgb(this);
			this.r = newRgb.r;
			this.g = newRgb.g;
			this.b = newRgb.b;
			this.l = $.colorpicker.rgbToLum(this.r, this.g, this.b);

			this.hex = $.colorpicker.rgbToHex(newRgb);
		};

		this.setHex = function(hex){
			this.hex = $.colorpicker.validateHex(hex);

			var newRgb = $.colorpicker.hexToRgb(this.hex);
			this.r = newRgb.r;
			this.g = newRgb.g;
			this.b = newRgb.b;

			var newHsv = $.colorpicker.rgbToHsv(newRgb);
			this.h = newHsv.h;
			this.s = newHsv.s;
			this.v = newHsv.v;
			this.l = $.colorpicker.rgbToLum(this.r, this.g, this.b);
		};

		if(args){
			if('hex' in args){
				this.setHex(args.hex);
			}else if('r' in args){
				this.setRgb(args.r, args.g, args.b);
			}else if('h' in args){
				this.setHsv(args.h, args.s, args.v);
			}
		}

		return this;
	},

	_attachColorpicker: function(target, settings){
		var input = $(target);
		if(input.hasClass(this.markerClassName)){
			return;
		}
		input.addClass(this._colorDivClass).addClass(this.markerClassName);
		if(!target.id){
			this.uuid += 1;
			target.id = 'cp' + this.uuid;
		}

		// check for settings on the control itself - in namespace 'color:'
		var inlineSettings = null;
		for(var attrName in this._defaults){
			var attrValue = target.getAttribute('color:' + attrName);
			if(attrValue){
				inlineSettings = inlineSettings || {};
				try{
					inlineSettings[attrName] = eval(attrValue);
				}catch(err){
					inlineSettings[attrName] = attrValue;
				}
			}
		}

		var inst = this._newInst(input);
		inst.settings = $.extend({}, settings || {}, inlineSettings || {});
		this._setColor(inst, input.val() || input.data('color') || this._get(inst, 'color'), true);

		if(input.is("input")){
			input.focus(function(){
				$.colorpicker._showColorpicker(target);
			}).keyup(function(){
				$.colorpicker._setColor(inst, this.value);
				$.colorpicker._updateColorpicker();
			}).bind("setData.colorpicker", function(e, key, value) {
				inst.settings[key] = value;
			}).bind("getData.colorpicker", function(e, key) {
				return $.colorpicker._get(inst, key);
			});
		}

		input.click(function(){
			$.colorpicker._showColorpicker(target);
		}).bind("refresh", function(){
			var $this = $(this);
			var inst = $.colorpicker._getInst(this);
			$.colorpicker._setColor(inst, input.val() || input.data('color') || $.colorpicker._get(inst, 'color'), true);
			$.colorpicker._updateColorpicker();
		});
	},

	_setColor: function(inst, hex, force){
		hex = $.colorpicker.validateHex(hex);
		inst.settings.color = hex;
		if(!this._isDragging) inst.color.setHex(hex);
		this._updateTarget(inst, force);
	},

	_newInst: function(target){
		var id = target[0].id.replace(/([^F-Za-z0-9_-])/g, '\\\\$1');
		var inst = {
			id: id,
			input: target,
			cpDiv: cpDiv,
			color: new $.colorpicker.color()
		};
		target.data(PROP_NAME, inst);
		return inst;
	},

	_checkExternalClick: function(e){
		if(!$.colorpicker._curInst){
			return;
		}
		var $target = $(e.target);
		if($target[0].id != $.colorpicker._mainDivId &&
			$target.parents('#' + $.colorpicker._mainDivId).length == 0 &&
			!$target.hasClass($.colorpicker.markerClassName)
		){
			$.colorpicker._hideColorpicker();
		}
	},

	_optionColorpicker: function(target, name, value){
		var inst = this._getInst(target);
		if(arguments.length == 2 && typeof name == 'string'){
			return (name == 'defaults' ? $.extend({}, $.colorpicker._defaults) :
				(inst ? (name == 'all' ? $.extend({}, inst.settings) :
				this._get(inst, name)) : null));
		}
		var settings = name || {};
		if(typeof name == 'string'){
			settings = {};
			settings[name] = value;
		}
		if(inst){
			if(this._curInst == inst){
				this._hideColorpicker();
			}
			var date = this._getDateColorpicker(target, true);
			var minDate = this._getMinMaxDate(inst, 'min');
			var maxDate = this._getMinMaxDate(inst, 'max');
			extendRemove(inst.settings, settings);
			$.colorpicker._updateColorpicker();
		}
	},

	_showColorpicker: function(input){
		input = input.target || input;
		var $input = $(input);
		if(input.disabled){
			return;
		}
		var inst = $.colorpicker._getInst(input);
		if(this._curInst && this._curInst != inst){
			this._triggerOnClose(this._curInst);
			this.cpDiv.stop(true, true);
		}
		this._curInst = inst;
		$.colorpicker._updateColorpicker();
		inst.input.addClass('selected');

		var showAnim = this._get(inst, 'showAnim');
		var duration = this._get(inst, 'duration');
		var postProcess = function(){
			$.colorpicker.cpDiv.addClass('visible');
		};

		cpDiv.addClass(this.controlsClassPrefix+$.colorpicker._get(inst, 'controlStyle'));
		this.cpDiv.oldColorDiv.data('hex', inst.color.hex).css('backgroundColor', '#'+inst.color.hex);
		this._colorpickerShowing = true;
		this.cpDiv[showAnim ? 'fadeIn' : 'show']((showAnim ? duration : null), postProcess);
		if(!showAnim){
			postProcess();
		}
		$.colorpicker._positionColorpicker(input);
	},

	_positionColorpicker: function(){
		var $input = $.colorpicker._curInst.input;
		var offset = $input.offset();
		var width = this.cpDiv.outerWidth();
		var height = this.cpDiv.outerHeight();
		var winWidth = $(window).width();
		var winHeight = $(window).height();
		offset.left += $input.outerWidth() + 10;
		if(offset.top + height > winHeight){
			offset.top = winHeight - height;
		}
		if(offset.left + width > winWidth){
			offset.left = winWidth - width;
		}
		this.cpDiv.css({top:0, left:0}).offset(offset);
	},

	_hideColorpicker: function(input){
		var inst = this._curInst;
		if(!inst || (input && inst != $.data(input, PROP_NAME))){
			return;
		}
		var postProcess = function(){
			$.colorpicker._curInst = null;
			$.colorpicker._triggerOnClose(inst);
		};
		if(this._colorpickerShowing){
			var showAnim = this._get(inst, 'showAnim');
			var duration = this._get(inst, 'duration');
			this.cpDiv[showAnim ? 'fadeOut' : 'hide']((showAnim ? duration : null), postProcess);
			if(!showAnim){
				postProcess();
			}
			this.cpDiv.removeClass('visible');
			this._colorpickerShowing = false;
		}else{
			postProcess();
		}
	},

	_triggerOnClose: function(inst){
		inst.input.removeClass('selected');
		this._setColor(inst, inst.color.hex);
		cpDiv.d1Div.control.add(cpDiv.d2Div.control).removeClass(this.controlsClassPrefix+'invert');
		cpDiv.removeClass(this.controlsClassPrefix+$.colorpicker._get(inst, 'controlStyle'));
	},

	_updateColorpicker: function(force){
		if(!this._curInst){
			return;
		}
		var inst = this._curInst;
		this.cpDiv.colorDiv.css('backgroundColor', '#'+inst.color.hex);
		$.colorpicker._updateInputs(force);
		$.colorpicker._updateMaps();
		$.colorpicker._updateControls();
		if(this._get(inst, 'realtime')){
			this._setColor(inst, inst.color.hex, force);
		}
	},

	_updateTarget: function(inst, force){
		inst.input.css({
			backgroundColor: '#'+inst.color.hex,
			color: (inst.color.l < $.colorpicker.minLum) ? '#fff' : '#000'
		});

		inst.input.data('color', inst.color.hex);
		if(force || !inst.input.is(':focus')){
			var val = inst.input.val();
			inst.input.val(
				val.indexOf('#') >= 0 ?
				'#' + inst.color.hex :
				inst.color.hex
			)
			if(val != inst.input.val()){
				inst.input.trigger('change');
			}
		}
	},

	_updateInputs: function(force){
		if(!this._curInst){
			return;
		}
		var inst = this._curInst;
		for(var i in this.cpDiv.inputs){
			if(i && inst.color[i] !== undefined){
				if(force || !this.cpDiv.inputs[i].is(':focus')){
					this.cpDiv.inputs[i].val(inst.color[i]);
				}
			}
		}
	},

	_updateMaps: function(){
		if(!this._curInst){
			return;
		}
		var inst = this._curInst;
		switch(this.mode){
			case 'h':
				this.cpDiv.d1Div.gradientDiv.css('background', '');
				this.cpDiv.d2Div.colorDiv.css('background-color', '#'+new $.colorpicker.color({
					h: inst.color.h,
					s: 100,
					v: 100
				}).hex);
				this.cpDiv.d1Div.gradientDiv.css('opacity', 1 - inst.color.v/100);
				this.cpDiv.d1Div.colorDiv.css('opacity', inst.color.s/100);
				this.cpDiv.d2Div.colorDiv.css('opacity', 1);
				this.cpDiv.d2Div.gradientDiv.css('opacity', 1);
			break;

			case 's':
				var c = new $.colorpicker.color({h:0, s:0, v:inst.color.v});
				this.cpDiv.d1Div.gradientDiv.css('background', 'linear-gradient(top, rgba('+c.r+','+c.g+','+c.b+',0) 0%,rgba('+c.r+','+c.g+','+c.b+',1) 100%);');
				this.cpDiv.d1Div.colorDiv.css('background-color', '#'+new $.colorpicker.color({
					h: inst.color.h,
					s: 100,
					v: inst.color.v
				}).hex);
				this.cpDiv.d1Div.gradientDiv.css('opacity', 1 - inst.color.v/100);
				this.cpDiv.d1Div.colorDiv.css('opacity', 1);
				this.cpDiv.d2Div.colorDiv.css('opacity', inst.color.s/100);
				this.cpDiv.d2Div.gradientDiv.css('opacity', 1);
			break;

			case 'v':
				this.cpDiv.d1Div.gradientDiv.css('background', '');
				this.cpDiv.d1Div.colorDiv.css('background-color', '#'+new $.colorpicker.color({
					h: inst.color.h,
					s: 100,
					v: 100
				}).hex);
				this.cpDiv.d1Div.gradientDiv.css('opacity', 1);
				this.cpDiv.d1Div.colorDiv.css('opacity', 1);
				this.cpDiv.d2Div.colorDiv.css('opacity', 1);
				this.cpDiv.d2Div.gradientDiv.css('opacity', 1 - inst.color.v/100);
			break;
		}
		$.colorpicker._setControlStyle();
	},

	_updateControls: function(){
		if(!this._curInst || this._isDragging){
			return;
		}
		var inst = this._curInst;

		var x, y, z;
		switch(this.mode){
			case 'h':
				x = inst.color.s*255/100;
				y = 255 - inst.color.v*255/100;
				z = 255 - inst.color.h*255/360;
			break;

			case 's':
				x = inst.color.h*255/360;
				y = 255 - inst.color.v*255/100;
				z = 255 - inst.color.s*255/100;
			break;

			case 'v':
				x = inst.color.h*255/360;
				y = 255 - inst.color.s*255/100;
				z = 255 - inst.color.v*255/100;
			break;
		}

		$.colorpicker._moveControl1d(z, true);
		$.colorpicker._moveControl2d(x, y, true);
	},

	_moveControl1d: function(z, moveOnly){
		if(!$.colorpicker._curInst) return;
		var inst = $.colorpicker._curInst;

		cpDiv.d1Div.control.css({top: Math.max(0, Math.min(255, parseInt(z)))+'px'});

		if(!moveOnly){
			switch($.colorpicker.mode){
				case 'h':
					z = 360 - z*360/256;
				break;

				case 's':
				case 'v':
					z = 100 - z*100/256;
				break;
			}

			inst.color[$.colorpicker.mode] = z;
			inst.color.setHsv(inst.color.h, inst.color.s, inst.color.v);
			$.colorpicker._updateColorpicker(true);
		}
	},

	_moveControl2d: function(x, y, moveOnly){
		if(!$.colorpicker._curInst) return;
		var inst = $.colorpicker._curInst;

		cpDiv.d2Div.control.css({
			left: Math.max(0, Math.min(255, parseInt(x)))+'px',
			top: Math.max(0, Math.min(255, parseInt(y)))+'px'
		});

		if(!moveOnly){
			switch($.colorpicker.mode){
				case 'h':
					x = x*100/256;
					y = 100 - y*100/256;
					inst.color.s = x;
					inst.color.v = y;
				break;

				case 's':
				case 'v':
					x = x*360/256;
					y = 100 - y*100/256;
					inst.color.h = x;
					inst.color[$.colorpicker.mode == 's' ? 'v' : 's'] = y;
				break;
			}

			inst.color.setHsv(inst.color.h, inst.color.s, inst.color.v);
			$.colorpicker._updateColorpicker(true);
		}
	},

	_mousemoveControl1d: function(e){
		$.colorpicker._moveControl1d(
			e.pageY - $.colorpicker.cpDiv.d1Div.offset().top
		);
		e.preventDefault();
		return false;
	},

	_mousemoveControl2d: function(e){
		var offset = $.colorpicker.cpDiv.d2Div.offset();
		$.colorpicker._moveControl2d(
			e.pageX - offset.left,
			e.pageY - offset.top
		);
		e.preventDefault();
		return false;
	},

	_setControlStyle: function(){
		if(!this._curInst || !$.colorpicker._get(this._curInst, 'invertControls')){
			return false;
		}

		if(this._curInst.color.l < $.colorpicker.minLum){
			cpDiv.d1Div.control.addClass(this.controlsClassPrefix+'invert');
			cpDiv.d2Div.control.addClass(this.controlsClassPrefix+'invert');
		}else{
			cpDiv.d1Div.control.removeClass(this.controlsClassPrefix+'invert');
			cpDiv.d2Div.control.removeClass(this.controlsClassPrefix+'invert');
		}
	},

	_get: function(inst, key){
		return inst.settings[key] !== undefined ? inst.settings[key] : this._defaults[key];
	},

	_getInst: function(target){
		try{
			return $(target).data(PROP_NAME);
		}catch(e){
			throw 'Missing instance data for this colorpicker';
		}
	},

	// Color functions

	hexToRgb: function(hex){
		hex = this.validateHex(hex);

		var r='00', g='00', b='00';

		if(hex.length == 3){
			r = hex.substring(0,1); r += r;
			g = hex.substring(1,2); g += g;
			b = hex.substring(2,3); b += b;
		}
		if(hex.length == 6){
			r = hex.substring(0,2);
			g = hex.substring(2,4);
			b = hex.substring(4,6);
		}

		return { r:this.hexToInt(r), g:this.hexToInt(g), b:this.hexToInt(b) };
	},

	_hexRegExp: new RegExp(/[a-fA-Z0-9]{6}|[a-fA-Z0-9]{3}/),

	validateHex: function(hex){
		return ((''+hex).match(this._hexRegExp) || [''])[0];
	},

	rgbToHex: function(rgb){
		return this.intToHex(rgb.r) + this.intToHex(rgb.g) + this.intToHex(rgb.b);
	},

	intToHex: function(dec){
		var result = (parseInt(dec).toString(16));
		if(result.length == 1)
			result = ("0" + result);
		return result.toUpperCase();
	},

	hexToInt: function(hex){
		return(parseInt(hex,16));
	},

	rgbToLum: function(r, g,b){
		return Math.round((0.2126*r + 0.7152*g + 0.0722*b)/2.55);
	},

	rgbToHsv: function(rgb){
		var r = rgb.r / 255;
		var g = rgb.g / 255;
		var b = rgb.b / 255;

		hsv = {h:0, s:0, v:0};

		var min = 0
		var max = 0;

		if(r >= g && r >= b){
			max = r;
			min = (g > b) ? b : g;
		}else if(g >= b && g >= r){
			max = g;
			min = (r > b) ? b : r;
		}else{
			max = b;
			min = (g > r) ? r : g;
		}

		hsv.v = max;
		hsv.s = (max) ? ((max - min) / max) : 0;

		if(!hsv.s){
			hsv.h = 0;
		}else{
			delta = max - min;
			if(r == max){
				hsv.h = (g - b) / delta;
			}else if(g == max){
				hsv.h = 2 + (b - r) / delta;
			}else{
				hsv.h = 4 + (r - g) / delta;
			}

			hsv.h = parseInt(hsv.h * 60);
			if(hsv.h < 0){
				hsv.h += 360;
			}
		}

		hsv.s = parseInt(hsv.s * 100);
		hsv.v = parseInt(hsv.v * 100);

		return hsv;
	},

	hsvToRgb: function(hsv){

		rgb = {r:0, g:0, b:0};

		var h = hsv.h;
		var s = hsv.s;
		var v = hsv.v;

		if(s == 0){
			if(v == 0){
				rgb.r = rgb.g = rgb.b = 0;
			}else{
				rgb.r = rgb.g = rgb.b = parseInt(v * 255 / 100);
			}
		}else{
			if(h == 360){
				h = 0;
			}
			h /= 60;

			// 100 scale
			s = s/100;
			v = v/100;

			var i = parseInt(h);
			var f = h - i;
			var p = v * (1 - s);
			var q = v * (1 - (s * f));
			var t = v * (1 - (s * (1 - f)));
			switch (i){
				case 0:
					rgb.r = v;
					rgb.g = t;
					rgb.b = p;
					break;
				case 1:
					rgb.r = q;
					rgb.g = v;
					rgb.b = p;
					break;
				case 2:
					rgb.r = p;
					rgb.g = v;
					rgb.b = t;
					break;
				case 3:
					rgb.r = p;
					rgb.g = q;
					rgb.b = v;
					break;
				case 4:
					rgb.r = t;
					rgb.g = p;
					rgb.b = v;
					break;
				case 5:
					rgb.r = v;
					rgb.g = p;
					rgb.b = q;
					break;
			}

			rgb.r = parseInt(rgb.r * 255);
			rgb.g = parseInt(rgb.g * 255);
			rgb.b = parseInt(rgb.b * 255);
		}

		return rgb;
	}
});

$.fn.colorpicker = function(options){
	if(!this.length){
		return this;
	}

	if(!$.colorpicker.initialized){
		$(document).mousedown($.colorpicker._checkExternalClick)
			.find('body').append($.colorpicker.cpDiv.hide())
			.find('#'+mainDivId+'-'+$.colorpicker.mode).closest('li').addClass('selected');

		for(var i in cpDiv.inputs){
			if(i){
				var $input = $(cpDiv.inputs[i]);
				if($input.data('mode')){
					$input.focus(function(){
						var $this = $(this);
						$this.closest('li').addClass('selected')
							.siblings('.selected').removeClass('selected');
						$.colorpicker.setMode($this.data('mode'));
					}).closest('li').click(function(){
						$(this).find('input').focus();
					});
				}

				$input.blur(function(){
					$.colorpicker._updateInputs();
				});

				switch(i){
					case 'h':
					case 's':
					case 'v':
						$input.keydown(function(e){
							if(!$.colorpicker._curInst) return;
							var $this = $(this);
							var inst = $.colorpicker._curInst;
							switch(e.keyCode){
								case 38:
								case 40:
									$this.val(parseInt($this.val()) + (e.shiftKey ? 10 : 1) * (e.keyCode == 40 ? -1 : 1));
									inst.color.setHsv(cpDiv.inputs.h.val(), cpDiv.inputs.s.val(), cpDiv.inputs.v.val());
									$.colorpicker._updateColorpicker(true);
								break;

								case 13:
									$.colorpicker._setColor(inst, inst.color.hex);
								break;

								default:
									return;
							}
						}).keyup(function(){
							if(!$.colorpicker._curInst) return;
							$.colorpicker._curInst.color.setHsv(cpDiv.inputs.h.val(), cpDiv.inputs.s.val(), cpDiv.inputs.v.val());
							$.colorpicker._updateColorpicker();
						});
					break;

					case 'r':
					case 'g':
					case 'b':
						$input.keydown(function(e){
							if(!$.colorpicker._curInst) return;
							var $this = $(this);
							var inst = $.colorpicker._curInst;
							switch(e.keyCode){
								case 38:
								case 40:
									$this.val(parseInt($this.val()) + (e.shiftKey ? 10 : 1) * (e.keyCode == 40 ? -1 : 1));
									inst.color.setRgb(cpDiv.inputs.r.val(), cpDiv.inputs.g.val(), cpDiv.inputs.b.val());
									$.colorpicker._updateColorpicker(true);
								break;

								case 13:
									$.colorpicker._setColor(inst, inst.color.hex);
								break;

								default:
									return;
							}
						}).keyup(function(){
							if(!$.colorpicker._curInst) return;
							$.colorpicker._curInst.color.setRgb(cpDiv.inputs.r.val(), cpDiv.inputs.g.val(), cpDiv.inputs.b.val());
							$.colorpicker._updateColorpicker();
						});
					break;

					case 'hex':
						$input.keyup(function(){
							if(!$.colorpicker._curInst) return;
							$.colorpicker._curInst.color.setHex(cpDiv.inputs.hex.val());
							$.colorpicker._updateColorpicker();
						});
					break;
				}
			}
		}
		cpDiv.oldColorDiv.click(function(){
			$.colorpicker._setColor($.colorpicker._curInst, $(this).data('hex'));
			$.colorpicker._updateColorpicker();
		});
		cpDiv.colorDiv.click(function(){
			if($.colorpicker._get($.colorpicker._curInst, 'realtime') || $.colorpicker._curInst.settings.color == $.colorpicker._curInst.color.hex){
				$.colorpicker._hideColorpicker();
			}else{
				$.colorpicker._setColor($.colorpicker._curInst, $.colorpicker._curInst.color.hex);
			}
		});

		cpDiv.d1Div.mousedown(function(e){
			$.colorpicker._isDragging = true;
			$.colorpicker._mousemoveControl1d(e);
			$(document).bind('mousemove', $.colorpicker._mousemoveControl1d);
			return false;
		})
		cpDiv.d2Div.mousedown(function(e){
			$.colorpicker._isDragging = true;
			$.colorpicker._mousemoveControl2d(e);
			$(document).bind('mousemove', $.colorpicker._mousemoveControl2d);
			return false;
		})
		$(document).mouseup(function(){
			$(document)
				.unbind('mousemove', $.colorpicker._mousemoveControl1d)
				.unbind('mousemove', $.colorpicker._mousemoveControl2d);
			$.colorpicker._isDragging = false;
			return false;
		});
		$(window).resize(function(){
			if($.colorpicker._colorpickerShowing){
				$.colorpicker._positionColorpicker();
			}
		})

		$.colorpicker.setMode($.colorpicker.mode);

		$.colorpicker.initialized = true;
	}

	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if(options == 'option' && arguments.length == 2 && typeof arguments[1] == 'string'){
		return $.colorpicker['_' + options + 'Colorpicker'].
			apply($.colorpicker, [this[0]].concat(otherArgs));
	}
	return this.each(function(){
		typeof options == 'string' ?
			$.colorpicker['_' + options + 'Colorpicker'].
				apply($.colorpicker, [this].concat(otherArgs)) :
			$.colorpicker._attachColorpicker(this, options);
	});
};

$.colorpicker = new Colorpicker();
$.colorpicker.initialized = false;
$.colorpicker.uuid = new Date().getTime();

})(jQuery);