// toYAML - Core - Copyright Gregor Schwab <isimpl@gmail.com> (MIT Licensed)
var defaults = {
    enableLinks: true,
    //default
    yamlCompatible: false,
    //default
    usePadding: true,
    extendObjects: false,
    maxLevel: 100,
    showHidden:false,
    maxLevelMessage: function() {
        return 'Max Object Depth has been reached: maxLevel ' + this.maxLevel + ' please set maxLevel to a higher level if your object is deeper than this level.'
    }
}

function setDefaults(def) {
   helper.extend(defaults, def);
}

function extendObjects(bool) {
    if (bool) {
        Object.prototype.toYaml = OOToYaml;
        Array.prototype.toYaml = OOToYaml;
    } else {
        delete Object.prototype.toYaml;
        delete Array.prototype.toYaml;
    }
}

function toYaml(obj, options){
  return yamlSerializer(options).toYaml(obj);
}

function preProcessLinks(obj, options){
  return yamlSerializer(options).preProcessLinks(obj);
}

exports.extendObjects = extendObjects;
exports.toYaml = toYaml
exports.preProcessLinks = preProcessLinks
exports.setDefaults = setDefaults

function OOToYaml(options) {
    return exports.toYaml(this, options);
}

function yamlSerializer(options) {
    var o,
    obja = [],
    newoba = [],
    Path = [],
    oPath = [];
    var opts = {};
    var idCounter = 0;
    var maxLevelError = false;
    var maxLevelKeyPath = "";
    
    helper.extend(opts, defaults, options);
    
    function toYaml(obj) {
        o = obj;

        var newObj = _preProcessLinks(obj);

        if (maxLevelError) {
            console.log(opts.maxLevelMessage() + "\nKeypath: " + maxLevelKeyPath)
        }
        var header = "";
        var ret = walkToYaml(newObj);
        if (ret !== "") return header + ret + "\n"
        else return ""
    }

    function walkToYaml(obj, l, before) {
        if (typeof before === 'undefined') var before = "";
        if (typeof l === 'undefined') var l = 0;
        //if (typeof obj === 'undefined'){throw new Error('obj undefinend context: before '+before)}
        var level = l;
        var out = "";
        if (opts.enableLinks) {
            var ret = searchLink(obj);
            //lookup the id of our object in the linksIn linksOut hashes
            out += ret.text;
            if (ret.stop === true) {
                //if it's a link node, we have to stop iteration here
                return out;
            }
        }

        if (Object.prototype.toString.call(obj.obj) === '[object Array]') {
            var i = 0,
            len = obj.obj.length;
            for (; i < len; i++) {
                //for each thang in the array
                out += '\n';
                //draw a new line
                out += drawIndent(level, 'array');
                //draw the indent
                out += walkToYaml(obj.obj[i], level + 1, 'array');
                //draw the inner thang
            }
            return out;
        }
        if (typeof obj.obj === 'object') {
            var i,
            index = 0;
            if (opts.usePadding) {
                //preprocess the object to find the perfect indent
                var maxKeyLength = 0;
                for (i in obj.obj) {
                    if (!obj.obj.hasOwnProperty(i)) continue;
                    maxKeyLength = Math.max(i.length, maxKeyLength);
                }
            }

            for (i in obj.obj) {
                if (!obj.obj.hasOwnProperty(i)) return out;
                if (index === 0 && !opts.yamlCompatible) {
                    //draw no newline on first item if we don't need to be yaml compatible
                    } else {
                    out += '\n';
                    //draw a new line
                    out += drawIndent(level, 'object');
                }

                out += i + ": ";
                //draw the attribute name with padding
                if (opts.usePadding) {
                    var padding = maxKeyLength - i.length;
                    out += drawIndent(padding);
                }
                out += walkToYaml(obj.obj[i], level + 1, 'object');
                //draw the inner thang
                index++;
            }
            //console.log('obj level ', level, 'out ', out);
            return out;
        }
        //if(typeof obj === 'string') return '"'+obj+'"'
        out+=obj.obj;
        return out;
    }

    function drawIndent(level, thang) {
        var indent = "";
        if (typeof thang == 'undefined') {
            //level variable is a padding instead
            var pad = level;
            for (var j = 0; j < pad; j++) {
                indent += " ";
            }
            //identation
            return indent;
        }
        //console.log("drawIndent ", level, thang)
        if (thang === "object") {
            for (var j = 0; j < level; j++) {
                indent += "  ";
            }
            //identation
        } else if (thang === "array") {
            for (var j = 0; j < level; j++) {
                indent += "  ";
            }
            //identation with a -
            indent += "- ";
        }
        return indent;
    }

    function preProcessLinks(obj) {
        o = obj;
        return _preProcessLinks(obj);
    }


    function _preProcessLinks(obj, l, k, kp) {
        var level = (typeof l === 'undefined') ? 0: l;
        if (typeof k === 'undefined')
        k = '',
        kp = ''
        if (kp !== '')
        kp = kp + '.' + k
        else
        kp = k;

        var newObj = {};
        newObj.level = level,
        newObj.obj = obj;
        newObj.key = k
        newObj.keyPath = kp;
        
        //the maximum Depth of Iterations may not be exceeded
        if (level > opts.maxLevel) {
            maxLevelError = true;
            maxLevelKeyPath = i + "." + maxLevelKeyPath;
            newObj.obj = opts.yamlCompatible ? "" : "[MAX LEVEL REACHED]"
            return newObj;
        }

        // Primitive types cannot have properties
        switch (typeof obj) {
        case 'undefined':
            newObj.obj = opts.yamlCompatible ? "" : "UNDEFINED";
            return newObj;

        case 'string':
            newObj.obj = JSON.stringify(obj).replace("'", "''")
            .replace(/\\"/g, '"')
            .replace(/(^"|"$)/g, "'");
            return newObj;

        case 'number':
        case 'boolean':
            newObj.obj = obj;
            return newObj;

        }
        // For some reason typeof null is "object", so special case here.
        if (obj === null) {
            newObj.obj = "null";
            return newObj;
        }

        // Look up the keys of the object.
        var visible_keys = Object.keys(obj);
        var keys = opts.showHidden ? Object.getOwnPropertyNames(obj) : visible_keys;

        // check for empty objects
        /*if (helper.isEmpty(obj)) {
            newObj.obj = '';
            return newObj;
        }*/

        // Dates without properties can be shortcutted
        if (helper.isDate(obj)) {
            //&& keys.length === 0) {
            newObj.obj = obj.toUTCString();
            return newObj;
        }
        
        //its an object or function
        //generate a local uId
        var uId = uniqueId('object');
        //each object gets an id also if its linked
        newObj.id = uId;
        
        //check if its a circular link first
        //CHECK HERE FOR CIRCLES LEAVE THIS HERE ! OTHERWISE IT WILL PUSH PRIMITIVE OBJECTS ON THE CIRCLE PATH, YOU DON'T WANT THAT!
        var idx;
        if ((idx = checkCircle(newObj)) > -1) {
            return newObj;
        }
        
        //check in history if its a link if yes return the obj
        //history of onjects and keeps linksIn and links Out of each object
        //is link
        if ((idx = history(newObj)) > -1) {
            return newObj;
        }

        // all Functions get shortcutted right now
        if (typeof obj === 'function' ){//&& keys.length === 0) {
          if (helper.isRegExp(obj)) {
            newObj.obj = opts.yamlCompatible ? "" : '[regexp]';
            newObj.type='function'
            return newObj;
          } else {
            var name = obj.name ? ': ' + obj.name : '';
            newObj.obj = opts.yamlCompatible ? "" : '[Function' + name + ']';
            newObj.type='function'            
            return newObj;            
          }
        }

        if (Object.prototype.toString.call(obj) === '[object Array]') {
            newObj.obj = [];
            var i = 0,
            len = obj.length;
            //newObj.obj = [];
            for (; i < len; i++) {
                //for each thang in the array
                newObj.obj.push(_preProcessLinks(obj[i], level + 1, i, kp));
                //copy on without change
            }
            removeFromCirclePath(newObj);
            return newObj;
        }
        if (typeof obj === 'object') {
            newObj.obj = {};
            var i,
            index = 0;
            for (i in obj) {
                if (!obj.hasOwnProperty(i)) continue;
                //newObj.obj[i]={};
                //newObj.obj[i].key=i;
                newObj.obj[i] = _preProcessLinks(obj[i], level + 1, i, kp);
                //draw the inner thang
                index++;
            }
            //pop the object from path before returning
            removeFromCirclePath(newObj);
            return newObj;
        }
    }

    function searchLink(newObj) {
        //id
        if (newObj.ref) return {
            'text': '&' + newObj.id,
            'stop': false
        };
        //a reference
        if (newObj.link) return {
            'text': '*' + newObj.link,
            'stop': true
        };
        //a link
        return {
            'text': "",
            'stop': false
        }
    }

    function checkCircle(newObj) {
        var idx;
        if ((idx = oPath.indexOf(newObj.obj)) > -1) {
            var refObj = Path[idx];
            //if (typeof refObj.obj !== "function") {
                //for now don't support functions
                refObj.ref = true;
                if (typeof refObj.refObjects == "undefined") refObj.refObjects = [];
                if (typeof refObj.circleObjects == "undefined") refObj.circleObjects = [];
                refObj.refObjects.push(newObj);
                refObj.circleObjects.push(newObj);
                newObj.link = refObj.id;
                newObj.obj = refObj.obj;
            //}
            return idx;
            //if its a circle dont push on path
        }
        Path.push(newObj);
        //"push" object to the Path
        oPath.push(newObj.obj);
        return - 1;
    }
    function removeFromCirclePath(obj) {
        Path.pop();
        oPath.pop();
        return obj;
    }

    function history(newObj) {

        //search for links in the history
        var idx = -1;
        if ((idx = obja.indexOf(newObj.obj)) > -1) {
            //loop
            var key = newoba[idx].id;
            //hash lookup
            var refObj = newoba[idx];
            //hash lookup
            //if (typeof refObj.obj !== "function") {
                //for now don't support functions
                refObj.ref = true;
                if (typeof refObj.refObjects == "undefined") refObj.refObjects = [];

                refObj.refObjects.push(newObj);
                //linkHashOut[newObj.id]=key;//this dock is for new objects link to first object = the links
                newObj.link = key;
                newObj.obj = refObj.obj;
            //}
            return idx;
            //if its a link dont push on history
        }
        //create a new history object
        obja.push(newObj.obj);
        newoba.push(newObj);
        return idx;
    }
    // Generate a unique integer id (unique within the entire client session).
    // Useful for temporary DOM ids.

    function uniqueId(prefix) {
      var id = idCounter++;
      return prefix ? prefix + id : id;
    }    
    //closure functions
    return {
        'toYaml': toYaml,
        'preProcessLinks': preProcessLinks
    }
}
//end serializer

var helper={}

helper.isArray = function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


helper.isRegExp = function isRegExp(re) {
  var s = '' + re;
  return re instanceof RegExp || // easy case
         // duck-type for context-switching evalcx case
         typeof(re) === 'function' &&
         re.constructor.name === 'RegExp' &&
         re.compile &&
         re.test &&
         re.exec &&
         s.match(/^\/.*\/[gim]{0,3}$/);
}


 helper.isDate = function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object.getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object.getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

 helper.isString = function isString(obj) {
  return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
}

// Is a given object empty?
helper.isEmpty = function isEmpty(obj) {
if (helper.isArray(obj) || helper.isString(obj)) return obj.length === 0;
 for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
 return true;
};

// Extend a given object with all the properties in passed-in object(s).
helper.extend = function extend(obj) {
  Array.prototype.slice.call(arguments, 1).forEach(function(source) {
    for (var prop in source) obj[prop] = source[prop];
  });
  return obj;
}


