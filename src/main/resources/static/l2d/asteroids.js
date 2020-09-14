//http://www.websiteasteroids.com
(function() {
	function Asteroids() {
		if (!window.ASTEROIDS) window.ASTEROIDS = {
			enemiesKilled: 0
		};

		function Vector(x, y) {
			if (typeof x == "Object") {
				this.x = x.x;
				this.y = x.y;
			} else {
				this.x = x;
				this.y = y;
			}
		};
		Vector.prototype = {
			cp: function() {
				return new Vector(this.x, this.y);
			},
			mul: function(factor) {
				this.x *= factor;
				this.y *= factor;
				return this;
			},
			mulNew: function(factor) {
				return new Vector(this.x * factor, this.y * factor);
			},
			add: function(vec) {
				this.x += vec.x;
				this.y += vec.y;
				return this;
			},
			addNew: function(vec) {
				return new Vector(this.x + vec.x, this.y + vec.y);
			},
			sub: function(vec) {
				this.x -= vec.x;
				this.y -= vec.y;
				return this;
			},
			subNew: function(vec) {
				return new Vector(this.x - vec.x, this.y - vec.y);
			},
			rotate: function(angle) {
				var x = this.x,
					y = this.y;
				this.x = x * Math.cos(angle) - Math.sin(angle) * y;
				this.y = x * Math.sin(angle) + Math.cos(angle) * y;
				return this;
			},
			rotateNew: function(angle) {
				return this.cp().rotate(angle);
			},
			setAngle: function(angle) {
				var l = this.len();
				this.x = Math.cos(angle) * l;
				this.y = Math.sin(angle) * l;
				return this;
			},
			setAngleNew: function(angle) {
				return this.cp().setAngle(angle);
			},
			setLength: function(length) {
				var l = this.len();
				if (l) this.mul(length / l);
				else this.x = this.y = length;
				return this;
			},
			setLengthNew: function(length) {
				return this.cp().setLength(length);
			},
			normalize: function() {
				var l = this.len();
				this.x /= l;
				this.y /= l;
				return this;
			},
			normalizeNew: function() {
				return this.cp().normalize();
			},
			angle: function() {
				return Math.atan2(this.y, this.x);
			},
			collidesWith: function(rect) {
				return this.x > rect.x && this.y > rect.y && this.x < rect.x + rect.width && this.y < rect.y + rect.height;
			},
			len: function() {
				var l = Math.sqrt(this.x * this.x + this.y * this.y);
				if (l < 0.005 && l > -0.005) return 0;
				return l;
			},
			is: function(test) {
				return typeof test == "object" && this.x == test.x && this.y == test.y;
			},
			toString: function() {
				return "[Vector(" + this.x + ", " + this.y + ") angle: " + this.angle() + ", length: " + this.len() + "]";
			}
		};

		function Line(p1, p2) {
			this.p1 = p1;
			this.p2 = p2;
		};
		Line.prototype = {
			shift: function(pos) {
				this.p1.add(pos);
				this.p2.add(pos);
			},
			intersectsWithRect: function(rect) {
				var LL = new Vector(rect.x, rect.y + rect.height);
				var UL = new Vector(rect.x, rect.y);
				var LR = new Vector(rect.x + rect.width, rect.y + rect.height);
				var UR = new Vector(rect.x + rect.width, rect.y);
				if (this.p1.x > LL.x && this.p1.x < UR.x && this.p1.y < LL.y && this.p1.y > UR.y && this.p2.x > LL.x && this.p2.x < UR.x && this.p2.y < LL.y && this.p2.y > UR.y) return true;
				if (this.intersectsLine(new Line(UL, LL))) return true;
				if (this.intersectsLine(new Line(LL, LR))) return true;
				if (this.intersectsLine(new Line(UL, UR))) return true;
				if (this.intersectsLine(new Line(UR, LR))) return true;
				return false;
			},
			intersectsLine: function(line2) {
				var v1 = this.p1,
					v2 = this.p2;
				var v3 = line2.p1,
					v4 = line2.p2;
				var denom = ((v4.y - v3.y) * (v2.x - v1.x)) - ((v4.x - v3.x) * (v2.y - v1.y));
				var numerator = ((v4.x - v3.x) * (v1.y - v3.y)) - ((v4.y - v3.y) * (v1.x - v3.x));
				var numerator2 = ((v2.x - v1.x) * (v1.y - v3.y)) - ((v2.y - v1.y) * (v1.x - v3.x));
				if (denom == 0.0) {
					return false;
				}
				var ua = numerator / denom;
				var ub = numerator2 / denom;
				return (ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0);
			}
		};
		var that = this;
		var isIE = !! window.ActiveXObject;
		var w = document.documentElement.clientWidth,
			h = document.documentElement.clientHeight;
		var playerWidth = 20,
			playerHeight = 30;
		var playerVerts = [
			[-1 * playerHeight / 2, -1 * playerWidth / 2],
			[-1 * playerHeight / 2, playerWidth / 2],
			[playerHeight / 2, 0]
		];
		var ignoredTypes = ["HTML", "HEAD", "BODY", "SCRIPT", "TITLE", "META", "STYLE", "LINK", "SHAPE", "LINE", "GROUP", "IMAGE", "STROKE", "FILL", "SKEW", "PATH", "TEXTPATH"];
		var hiddenTypes = ["BR", "HR"];
		var FPS = 50;
		var acc = 300;
		var maxSpeed = 600;
		var rotSpeed = 360;
		var bulletSpeed = 700;
		var particleSpeed = 400;
		var timeBetweenFire = 150;
		var timeBetweenBlink = 250;
		var timeBetweenEnemyUpdate = isIE ? 10000 : 2000;
		var bulletRadius = 2;
		var maxParticles = isIE ? 20 : 40;
		var maxBullets = isIE ? 10 : 20;
		this.flame = {
			r: [],
			y: []
		};
		this.toggleBlinkStyle = function() {
			if (this.updated.blink.isActive) {
				removeClass(document.body, "ASTEROIDSBLINK");
			} else {
				addClass(document.body, "ASTEROIDSBLINK");
			}
			this.updated.blink.isActive = !this.updated.blink.isActive;
		};
		addStylesheet(".ASTEROIDSBLINK .ASTEROIDSYEAHENEMY", "outline: 2px dotted red;");
		this.pos = new Vector(100, 100);
		this.lastPos = false;
		this.vel = new Vector(0, 0);
		this.dir = new Vector(0, 1);
		this.keysPressed = {};
		this.firedAt = false;
		this.updated = {
			enemies: false,
			flame: new Date().getTime(),
			blink: {
				time: 0,
				isActive: false
			}
		};
		this.scrollPos = new Vector(0, 0);
		this.bullets = [];
		this.enemies = [];
		this.dying = [];
		this.totalEnemies = 0;
		this.particles = [];

		function updateEnemyIndex() {
			for (var i = 0, enemy; enemy = that.enemies[i]; i++)
			removeClass(enemy, "ASTEROIDSYEAHENEMY");
			var all = document.body.getElementsByTagName("*");
			that.enemies = [];
			for (var i = 0, el; el = all[i]; i++) {
				if (indexOf(ignoredTypes, el.tagName.toUpperCase()) == -1 && el.prefix != "g_vml_" && hasOnlyTextualChildren(el) && el.className != "ASTEROIDSYEAH" && el.offsetHeight > 0) {
					el.aSize = size(el);
					that.enemies.push(el);
					addClass(el, "ASTEROIDSYEAHENEMY");
					if (!el.aAdded) {
						el.aAdded = true;
						that.totalEnemies++;
					}
				}
			}
		};
		updateEnemyIndex();
		var createFlames;
		(function() {
			var rWidth = playerWidth,
				rIncrease = playerWidth * 0.1,
				yWidth = playerWidth * 0.6,
				yIncrease = yWidth * 0.2,
				halfR = rWidth / 2,
				halfY = yWidth / 2,
				halfPlayerHeight = playerHeight / 2;
			createFlames = function() {
				that.flame.r = [
					[-1 * halfPlayerHeight, -1 * halfR]
				];
				that.flame.y = [
					[-1 * halfPlayerHeight, -1 * halfY]
				];
				for (var x = 0; x < rWidth; x += rIncrease) {
					that.flame.r.push([-random(2, 7) - halfPlayerHeight, x - halfR]);
				}
				that.flame.r.push([-1 * halfPlayerHeight, halfR]);
				for (var x = 0; x < yWidth; x += yIncrease) {
					that.flame.y.push([-random(2, 7) - halfPlayerHeight, x - halfY]);
				}
				that.flame.y.push([-1 * halfPlayerHeight, halfY]);
			};
		})();
		createFlames();

		function radians(deg) {
			return deg * 0.0174532925;
		};

		function degrees(rad) {
			return rad * 57.2957795;
		};

		function random(from, to) {
			return Math.floor(Math.random() * (to + 1) + from);
		};

		function code(name) {
			var table = {
				"up": 38,
				"down": 40,
				"left": 37,
				"right": 39,
				"esc": 27
			};
			if (table[name]) return table[name];
			return name.charCodeAt(0);
		};

		function boundsCheck(vec) {
			if (vec.x > w) vec.x = 0;
			else if (vec.x < 0) vec.x = w;
			if (vec.y > h) vec.y = 0;
			else if (vec.y < 0) vec.y = h;
		};

		function size(element) {
			var el = element,
				left = 0,
				top = 0;
			do {
				left += el.offsetLeft || 0;
				top += el.offsetTop || 0;
				el = el.offsetParent;
			} while (el);
			return {
				x: left,
				y: top,
				width: element.offsetWidth || 10,
				height: element.offsetHeight || 10
			};
		};

		function addEvent(obj, type, fn) {
			if (obj.addEventListener) obj.addEventListener(type, fn, false);
			else if (obj.attachEvent) {
				obj["e" + type + fn] = fn;
				obj[type + fn] = function() {
					obj["e" + type + fn](window.event);
				}
				obj.attachEvent("on" + type, obj[type + fn]);
			}
		}

		function removeEvent(obj, type, fn) {
			if (obj.removeEventListener) obj.removeEventListener(type, fn, false);
			else if (obj.detachEvent) {
				obj.detachEvent("on" + type, obj[type + fn]);
				obj[type + fn] = null;
				obj["e" + type + fn] = null;
			}
		}

		function arrayRemove(array, from, to) {
			var rest = array.slice((to || from) + 1 || array.length);
			array.length = from < 0 ? array.length + from : from;
			return array.push.apply(array, rest);
		};

		function applyVisibility(vis) {
			for (var i = 0, p; p = window.ASTEROIDSPLAYERS[i]; i++) {
				p.gameContainer.style.visibility = vis;
			}
		}

		function getElementFromPoint(x, y) {
			applyVisibility("hidden");
			var element = document.elementFromPoint(x, y);
			if (!element) {
				applyVisibility("visible");
				return false;
			}
			if (element.nodeType == 3) element = element.parentNode;
			applyVisibility("visible");
			return element;
		};

		function addParticles(startPos) {
			var time = new Date().getTime();
			var amount = maxParticles;
			for (var i = 0; i < amount; i++) {
				that.particles.push({
					dir: (new Vector(Math.random() * 20 - 10, Math.random() * 20 - 10)).normalize(),
					pos: startPos.cp(),
					cameAlive: time
				});
			}
		};

		function setScore() {
			that.points.innerHTML = window.ASTEROIDS.enemiesKilled * 10;
		};

		function hasOnlyTextualChildren(element) {
			if (element.offsetLeft < -100 && element.offsetWidth > 0 && element.offsetHeight > 0) return false;
			if (indexOf(hiddenTypes, element.tagName) != -1) return true;
			if (element.offsetWidth == 0 && element.offsetHeight == 0) return false;
			for (var i = 0; i < element.childNodes.length; i++) {
				if (indexOf(hiddenTypes, element.childNodes[i].tagName) == -1 && element.childNodes[i].childNodes.length != 0) return false;
			}
			return true;
		};

		function indexOf(arr, item, from) {
			if (arr.indexOf) return arr.indexOf(item, from);
			var len = arr.length;
			for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++) {
				if (arr[i] === item) return i;
			}
			return -1;
		};

		function addClass(element, className) {
			if (element.className.indexOf(className) == -1) element.className = (element.className + " " + className).replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
		};

		function removeClass(element, className) {
			element.className = element.className.replace(new RegExp("(^|\\s)" + className + "(?:\\s|$)"), "$1");
		};

		function addStylesheet(selector, rules) {
			var stylesheet = document.createElement("style");
			stylesheet.type = "text/css";
			stylesheet.rel = "stylesheet";
			stylesheet.id = "ASTEROIDSYEAHSTYLES";
			try {
				stylesheet.innerHTML = selector + "{" + rules + "}";
			} catch (e) {
				stylesheet.styleSheet.addRule(selector, rules);
			}
			document.getElementsByTagName("head")[0].appendChild(stylesheet);
		};

		function removeStylesheet(name) {
			var stylesheet = document.getElementById(name);
			if (stylesheet) {
				stylesheet.parentNode.removeChild(stylesheet);
			}
		};
		this.gameContainer = document.createElement("div");
		this.gameContainer.className = "ASTEROIDSYEAH";
		document.body.appendChild(this.gameContainer);
		this.canvas = document.createElement("canvas");
		this.canvas.setAttribute("width", w);
		this.canvas.setAttribute("height", h);
		this.canvas.className = "ASTEROIDSYEAH";
		with(this.canvas.style) {
			width = w + "px";
			height = h + "px";
			position = "fixed";
			top = "0px";
			left = "0px";
			bottom = "0px";
			right = "0px";
			zIndex = "10000";
		}
		if (typeof G_vmlCanvasManager != "undefined") {
			this.canvas = G_vmlCanvasManager.initElement(this.canvas);
			if (!this.canvas.getContext) {
				alert("So... you are using IE?  Sorry but at the moment WebsiteAsteroids only supports Firefox");
			}
		} else {
			if (!this.canvas.getContext) {
				alert("This program does not yet support your browser. Please join me at https://github.com/erkie/erkie.github.com if you think you can help");
			}
		}
		addEvent(this.canvas, "mousedown", function(e) {
			e = e || window.event;
			var message = document.createElement("span");
			message.style.position = "absolute";
			message.style.color = "red";
			message.innerHTML = "Press Esc to Quit";
			document.body.appendChild(message);
			var x = e.pageX || (e.clientX + document.documentElement.scrollLeft);
			var y = e.pageY || (e.clientY + document.documentElement.scrollTop);
			message.style.left = x - message.offsetWidth / 2 + "px";
			message.style.top = y - message.offsetHeight / 2 + "px";
			setTimeout(function() {
				try {
					message.parentNode.removeChild(message);
				} catch (e) {}
			}, 1000);
		});
		var eventResize = function() {
				that.canvas.style.display = "none";
				w = document.documentElement.clientWidth;
				h = document.documentElement.clientHeight;
				that.canvas.setAttribute("width", w);
				that.canvas.setAttribute("height", h);
				with(that.canvas.style) {
					display = "block";
					width = w + "px";
					height = h + "px";
				}
			};
		addEvent(window, "resize", eventResize);
		this.gameContainer.appendChild(this.canvas);
		this.ctx = this.canvas.getContext("2d");
		this.ctx.fillStyle = "black";
		this.ctx.strokeStyle = "black";
		if (!document.getElementById("ASTEROIDS-NAVIGATION")) {
			this.navigation = document.createElement("div");
			this.navigation.id = "ASTEROIDS-NAVIGATION";
			this.navigation.className = "ASTEROIDSYEAH";
			with(this.navigation.style) {
				fontFamily = "Arial,sans-serif";
				position = "fixed";
				zIndex = "10001";
				bottom = "20px";
				right = "10px";
				textAlign = "right";
			}
			this.navigation.innerHTML = "(Press Esc to Quit) ";
			this.gameContainer.appendChild(this.navigation);
			this.points = document.createElement("span");
			this.points.id = "ASTEROIDS-POINTS";
			this.points.style.font = "28pt Arial, sans-serif";
			this.points.style.fontWeight = "bold";
			this.points.className = "ASTEROIDSYEAH";
			this.navigation.appendChild(this.points);
		} else {
			this.navigation = document.getElementById("ASTEROIDS-NAVIGATION");
			this.points = document.getElementById("ASTEROIDS-POINTS");
		}
		setScore();
		if (typeof G_vmlCanvasManager != "undefined") {
			var children = this.canvas.getElementsByTagName("*");
			for (var i = 0, c; c = children[i]; i++)
			addClass(c, "ASTEROIDSYEAH");
		}
		var eventKeydown = function(event) {
				event = event || window.event;
				that.keysPressed[event.keyCode] = true;
				switch (event.keyCode) {
				case code(" "):
					that.firedAt = 1;
					break;
				}
				if (indexOf([code("up"), code("down"), code("right"), code("left"), code(" "), code("B"), code("W"), code("A"), code("S"), code("D")], event.keyCode) != -1) {
					if (event.preventDefault) event.preventDefault();
					if (event.stopPropagation) event.stopPropagation();
					event.returnValue = false;
					event.cancelBubble = true;
					return false;
				}
			};
		addEvent(document, "keydown", eventKeydown);
		var eventKeypress = function(event) {
				event = event || window.event;
				if (indexOf([code("up"), code("down"), code("right"), code("left"), code(" "), code("W"), code("A"), code("S"), code("D")], event.keyCode || event.which) != -1) {
					if (event.preventDefault) event.preventDefault();
					if (event.stopPropagation) event.stopPropagation();
					event.returnValue = false;
					event.cancelBubble = true;
					return false;
				}
			};
		addEvent(document, "keypress", eventKeypress);
		var eventKeyup = function(event) {
				event = event || window.event;
				that.keysPressed[event.keyCode] = false;
				if (indexOf([code("up"), code("down"), code("right"), code("left"), code(" "), code("B"), code("W"), code("A"), code("S"), code("D")], event.keyCode) != -1) {
					if (event.preventDefault) event.preventDefault();
					if (event.stopPropagation) event.stopPropagation();
					event.returnValue = false;
					event.cancelBubble = true;
					return false;
				}
			};
		addEvent(document, "keyup", eventKeyup);
		this.ctx.clear = function() {
			this.clearRect(0, 0, w, h);
		};
		this.ctx.clear();
		this.ctx.drawLine = function(xFrom, yFrom, xTo, yTo) {
			this.beginPath();
			this.moveTo(xFrom, yFrom);
			this.lineTo(xTo, yTo);
			this.lineTo(xTo + 1, yTo + 1);
			this.closePath();
			this.fill();
		};
		this.ctx.tracePoly = function(verts) {
			this.beginPath();
			this.moveTo(verts[0][0], verts[0][1]);
			for (var i = 1; i < verts.length; i++)
			this.lineTo(verts[i][0], verts[i][1]);
			this.closePath();
		};
		this.ctx.drawPlayer = function() {
			this.save();
			this.translate(that.pos.x, that.pos.y);
			this.rotate(that.dir.angle());
			this.tracePoly(playerVerts);
			this.fillStyle = "white";
			this.fill();
			this.tracePoly(playerVerts);
			this.stroke();
			this.restore();
		};
		var PI_SQ = Math.PI * 2;
		this.ctx.drawBullets = function(bullets) {
			for (var i = 0; i < bullets.length; i++) {
				this.beginPath();
				this.arc(bullets[i].pos.x, bullets[i].pos.y, bulletRadius, 0, PI_SQ, true);
				this.closePath();
				this.fill();
			}
		};
		var randomParticleColor = function() {
				return (["red", "yellow"])[random(0, 1)];
			};
		this.ctx.drawParticles = function(particles) {
			var oldColor = this.fillStyle;
			for (var i = 0; i < particles.length; i++) {
				this.fillStyle = randomParticleColor();
				this.drawLine(particles[i].pos.x, particles[i].pos.y, particles[i].pos.x - particles[i].dir.x * 10, particles[i].pos.y - particles[i].dir.y * 10);
			}
			this.fillStyle = oldColor;
		};
		this.ctx.drawFlames = function(flame) {
			this.save();
			this.translate(that.pos.x, that.pos.y);
			this.rotate(that.dir.angle());
			var oldColor = this.strokeStyle;
			this.strokeStyle = "red";
			this.tracePoly(flame.r);
			this.stroke();
			this.strokeStyle = "yellow";
			this.tracePoly(flame.y);
			this.stroke();
			this.strokeStyle = oldColor;
			this.restore();
		}
		addParticles(this.pos);
		addClass(document.body, "ASTEROIDSYEAH");
		var isRunning = true;
		var lastUpdate = new Date().getTime();
		this.update = function() {
			var forceChange = false;
			var nowTime = new Date().getTime();
			var tDelta = (nowTime - lastUpdate) / 1000;
			lastUpdate = nowTime;
			var drawFlame = false;
			if (nowTime - this.updated.flame > 50) {
				createFlames();
				this.updated.flame = nowTime;
			}
			this.scrollPos.x = window.pageXOffset || document.documentElement.scrollLeft;
			this.scrollPos.y = window.pageYOffset || document.documentElement.scrollTop;
			if ((this.keysPressed[code("up")]) || (this.keysPressed[code("W")])) {
				this.vel.add(this.dir.mulNew(acc * tDelta));
				drawFlame = true;
			} else {
				this.vel.mul(0.96);
			}
			if ((this.keysPressed[code("left")]) || (this.keysPressed[code("A")])) {
				forceChange = true;
				this.dir.rotate(radians(rotSpeed * tDelta * -1));
			}
			if ((this.keysPressed[code("right")]) || (this.keysPressed[code("D")])) {
				forceChange = true;
				this.dir.rotate(radians(rotSpeed * tDelta));
			}
			if (this.keysPressed[code(" ")] && nowTime - this.firedAt > timeBetweenFire) {
				this.bullets.unshift({
					"dir": this.dir.cp(),
					"pos": this.pos.cp(),
					"startVel": this.vel.cp(),
					"cameAlive": nowTime
				});
				this.firedAt = nowTime;
				if (this.bullets.length > maxBullets) {
					this.bullets.pop();
				}
			}
			if (this.keysPressed[code("B")]) {
				if (!this.updated.enemies) {
					updateEnemyIndex();
					this.updated.enemies = true;
				}
				forceChange = true;
				this.updated.blink.time += tDelta * 1000;
				if (this.updated.blink.time > timeBetweenBlink) {
					this.toggleBlinkStyle();
					this.updated.blink.time = 0;
				}
			} else {
				this.updated.enemies = false;
			}
			if (this.keysPressed[code("esc")]) {
				destroy.apply(this);
				return;
			}
			if (this.vel.len() > maxSpeed) {
				this.vel.setLength(maxSpeed);
			}
			this.pos.add(this.vel.mulNew(tDelta));
			if (this.pos.x > w) {
				window.scrollTo(this.scrollPos.x + 50, this.scrollPos.y);
				this.pos.x = 0;
			} else if (this.pos.x < 0) {
				window.scrollTo(this.scrollPos.x - 50, this.scrollPos.y);
				this.pos.x = w;
			}
			if (this.pos.y > h) {
				window.scrollTo(this.scrollPos.x, this.scrollPos.y + h * 0.75);
				this.pos.y = 0;
			} else if (this.pos.y < 0) {
				window.scrollTo(this.scrollPos.x, this.scrollPos.y - h * 0.75);
				this.pos.y = h;
			}
			for (var i = this.bullets.length - 1; i >= 0; i--) {
				if (nowTime - this.bullets[i].cameAlive > 2000) {
					this.bullets.splice(i, 1);
					forceChange = true;
					continue;
				}
				var bulletVel = this.bullets[i].dir.setLengthNew(bulletSpeed * tDelta).add(this.bullets[i].startVel.mulNew(tDelta));
				this.bullets[i].pos.add(bulletVel);
				boundsCheck(this.bullets[i].pos);
				var murdered = getElementFromPoint(this.bullets[i].pos.x, this.bullets[i].pos.y);
				if (murdered && murdered.tagName && indexOf(ignoredTypes, murdered.tagName.toUpperCase()) == -1 && hasOnlyTextualChildren(murdered) && murdered.className != "ASTEROIDSYEAH") {
					didKill = true;
					addParticles(this.bullets[i].pos);
					this.dying.push(murdered);
					this.bullets.splice(i, 1);
					continue;
				}
			}
			if (this.dying.length) {
				for (var i = this.dying.length - 1; i >= 0; i--) {
					try {
						if (this.dying[i].parentNode) window.ASTEROIDS.enemiesKilled++;
						this.dying[i].parentNode.removeChild(this.dying[i]);
					} catch (e) {}
				}
				setScore();
				this.dying = [];
			}
			for (var i = this.particles.length - 1; i >= 0; i--) {
				this.particles[i].pos.add(this.particles[i].dir.mulNew(particleSpeed * tDelta * Math.random()));
				if (nowTime - this.particles[i].cameAlive > 1000) {
					this.particles.splice(i, 1);
					forceChange = true;
					continue;
				}
			}
			if (forceChange || this.bullets.length != 0 || this.particles.length != 0 || !this.pos.is(this.lastPos) || this.vel.len() > 0) {
				this.ctx.clear();
				this.ctx.drawPlayer();
				if (drawFlame) this.ctx.drawFlames(that.flame);
				if (this.bullets.length) {
					this.ctx.drawBullets(this.bullets);
				}
				if (this.particles.length) {
					this.ctx.drawParticles(this.particles);
				}
			}
			this.lastPos = this.pos;
			setTimeout(updateFunc, 1000 / FPS);
		}
		var updateFunc = function() {
				that.update.call(that);
			};
		setTimeout(updateFunc, 1000 / FPS);

		function destroy() {
			removeEvent(document, "keydown", eventKeydown);
			removeEvent(document, "keypress", eventKeypress);
			removeEvent(document, "keyup", eventKeyup);
			removeEvent(window, "resize", eventResize);
			isRunning = false;
			removeStylesheet("ASTEROIDSYEAHSTYLES");
			removeClass(document.body, "ASTEROIDSYEAH");
			this.gameContainer.parentNode.removeChild(this.gameContainer);
		};
	}
	if (!window.ASTEROIDSPLAYERS) window.ASTEROIDSPLAYERS = [];
	if (window.ActiveXObject) {
		try {
			var xamlScript = document.createElement("script");
			xamlScript.setAttribute("type", "text/xaml");
			xamlScript.textContent = '<?xml version="1.0"?><Canvas xmlns="https://schemas.microsoft.com/client/2007"></Canvas>';
			document.getElementsByTagName("head")[0].appendChild(xamlScript);
		} catch (e) {}
		var script = document.createElement("script");
		script.setAttribute("type", "text/javascript");
		script.onreadystatechange = function() {
			if (script.readyState == "loaded" || script.readyState == "complete") {
				if (typeof G_vmlCanvasManager != "undefined") window.ASTEROIDSPLAYERS[window.ASTEROIDSPLAYERS.length] = new Asteroids();
			}
		};
		script.src = "https://erkie.github.com/excanvas.js";
		document.getElementsByTagName("head")[0].appendChild(script);
	} else window.ASTEROIDSPLAYERS[window.ASTEROIDSPLAYERS.length] = new Asteroids();
})();
