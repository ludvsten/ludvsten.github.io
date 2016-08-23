if (typeof Array.prototype.indexOf !== 'function') {
    Array.prototype.indexOf = function (item) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === item) {
                return i;
            }
        }
        return -1;
    };
}

window.easy = (function () {

    function Easy(els) {
        for (var i = 0; i < els.length; i++) {
            this[i] = els[i];
        }
        this.length = els.length;
    }
    Easy.prototype.map = function (cb) {
        var results = [],
            i = 0;
        for (; i < this.length; i++) {
            results.push(cb.call(this, this[i], i));
        }
        return results;
    };
    Easy.prototype.forEach = function (cb) {
        this.map(cb);
        return this;
    };
    Easy.prototype.mapOne = function (cb) {
        var m = this.map(cb);
        return m.length > 1 ? m : m[0];
    };
    Easy.prototype.text = function (text) {
        if (typeof text !== "undefined") {
            return this.forEach(function (el) {
                el.innerText = text;
            });
        } else {
            return this.mapOne(function (el) {
                return el.innerText;
            });
        }
    };
    Easy.prototype.html = function () {

        if (typeof html !== "undefined") {
            this.forEach(function (el) {
                el.innerHTML = html;
            });
            return this;
        } else {
            return this.mapOne(function (el) {
                return el.innerHTML;
            });
        }
    };
    Easy.prototype.aClass = (function (classes) {
        var className = "";
        if (typeof classes !== "string") {
            for (var i = 0; i < classes.length; i++) {
                className += " " + classes[i];
            }
        } else {
            className = " " + classes;
        }
        return this.forEach(function (el) {
            el.className += className;
        });
    });
    Easy.prototype.rmClass = (function (c) {
        return this.forEach(function () {
            var cs = el.className.split(" "),
                i;

            while ((i = cs.indexOf(c)) > -1) {
                cs.slice(0, i).concat(cs.slice(++i));
            }
            el.className = cs.join(" ")
        });
    });
    Easy.prototype.css = (function (prop, val) {
        return this.forEach(function (el) {
            if (typeof prop == 'object') {
                for (var key in prop) {
                    el.style[key] = prop[key];
                }
            } else {
                el.style[prop] = val;
            }
        });
    });
    Easy.prototype.attr = function (attr, val) {
        if (typeof val !== "undefined") {
            return this.forEach(function (el) {
                el.setAttribute(attr, val);
            });
        } else {
            return this.mapOne(function (el) {
                return el.getAttribute(attr);
            });
        }
    };
    Easy.prototype.append = function (els) {

        return this.forEach(function (parEl, i) {
            els.forEach(function (childEl) {
                parEl.appendChild((i > 0) ? childEl.cloneNode(true) : childEl);
            });
        });
    };
    Easy.prototype.prepend = function (els) {

        return this.forEach(function (parEl, i) {

            for (var j = els.length - 1; j > -1; j--) {
                childEl = (i > 0) ? els[j].cloneNode(true) : els[j];

                parEl.insertBefore(childEl, parEl, parEl.firstChild);
            }
        });
    };
    Easy.prototype.rm = function () {
        return this.forEach(function (el) {
            return el.parentNode.removeChild(el);
        });
    };

    Easy.prototype.keyUp = function (key, evt) {
       //keyup need fixing
       if(key == 'Number') {
        this.on('keyup', function(event){
          if(event.keyCode == key) {
            return evt();
          }
        });
    }
      else {
        this.on('keydown', evt);
      }
    };

    Easy.prototype.on = (function () {
        if (document.addEventListener) {
            return function (evt, fn) {
                return this.forEach(function (el) {
                    el.addEventListener(evt, fn, false);
                });
            };
        } else if (document.attachEvent) {
            return function (evt, fn) {
                return this.forEach(function () {
                    el.attachEvent('on', +evt, fn);
                });
            };
        } else {
            return function (evt, fn) {
                return this.forEach(function (el) {
                    el["on" + evt] = fn;
                });
            };
        }
    }());

    Easy.prototype.off = (function () {
        if (document.removeEventListener) {
            return function (evt, fn) {
                return this.forEach(function (el) {
                    el.detachEvent("on" + evt, fn);
                });
            };
        } else if (document.detachEvent) {
            return function (evt, fn) {
                return this.forEach(function (el) {
                    el.detachEvent("on" + evt, fn);

                });
            };
        } else {
            return (function (evt, fn) {
                return this.forEach(function (evt, fn) {
                    el["on" + evt] = null;
                });
            });
        }
    }());

    Easy.prototype.filterJSON = function (collection, pred) {
        var result, pred = new Array(),
            index = -1;

        if (typeof collection === 'Object') {
            while (++index < arguments.length) {
                pred.push(arguments[index]);
            }
            result = JSON.stringify(collection, pred);
            return JSON.parse(result);
        }
    };

    // objlike check string is object like //
    Easy.prototype.objlike = function (o) {
        var re = /{(.*)}/;
        if (typeof o == 'string') {
            if (o.match(re)) {
                return true;
            } else {
                return false;
            }
        }

    }
    Easy.prototype.ready = function (evt) {
        this.addEventListener('DOMContentLoaded', evt);
    };


    var easy = {
        elem: function (selector) {

            var els;

            if (typeof selector === 'string') {
                els = document.querySelectorAll(selector);
            } else if (selector.length) {
                els = selector;
            } else {
                els = [selector];
            }
            return new Easy(els);
        },
        create: function (tag, attr) {
            var el = new Easy([document.createElement(tag)]);

            if (attr) {
                if (attr.className) {
                    el.aClass(attr.className);
                    delete attr.className;
                }
                if (attr.text) {
                    el.text(attr.text);
                    delete attr.text;
                }
                for (var key in attr) {
                    if (attr.hasOwnProperty(key)) {
                        el.attr(key, attr[key]);
                    }
                }
            }
            return el;
        },
        xCall: function (method, url, callback, spinner) {
          var result, delay = delay || 300,
              xc = new XMLHttpRequest();

          xc.onreadystatechange = function () {
              if (xc.readyState == 4 && xc.status == 200) {
                  setTimeout(function () {
                      result = xc.responseText;
                      if (typeof result == 'string') {
                          return callback(JSON.parse(result));
                      } else {
                          return result;
                      }
                  }, delay);
              }
              if (xc.readyState == 2) {
                  if (typeof spinner == 'function') {
                      return spinner;
                  }
              }
          };
          xc.open(method, url, true);
          xc.send();
      }
    };

    return easy;
}());
var S_ = new Object(easy.elem);
