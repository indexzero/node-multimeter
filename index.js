var charmer = require('charm');
var Bar = require('./lib/bar');
var Stack = require('./lib/stack');

var exports = module.exports = function (c) {
    if (c instanceof charmer.Charm) {
        var charm = c;
    }
    else {
        var charm = charmer.apply(null, arguments);
        charm.on('^C', function () {
            charm.destroy();
        });
    }
    
    // Creates a bar or a stack
    function createBar(x, y, params) {
      if (params.type === 'stack') {
          var stack = new Stack(charm, x, y, params);
          multi.stacks.push(stack);
          stack.offset = multi.offset;
          multi.on('offset', function (o) {
              stack.offset = o;
          });
          return stack;
      }

      var bar = new Bar(charm, x, y, params);
      multi.bars.push(bar);
      bar.offset = multi.offset;
      multi.on('offset', function (o) {
          bar.offset = o;
      });

      return bar;
    }

    var multi = function (x, y, params) {
        if (typeof x === 'object') {
            params = x;
            x = params.x;
            y = params.y;
        }
        if (!params) params = {};
        
        if (x === undefined) x = '+0';
        if (y === undefined) y = '+0';
        
        return createBar(x, y, params);
    };
    multi.bars = [];
    multi.stacks = [];
    
    multi.rel = function (x, y, params) {
        return multi(x, '-' + y, params);
    };
    
    multi.drop = function (params, cb) {
        if (!cb) { cb = params; params = {} }
        
        charm.position(function (x, y) {
            cb(createBar(x, y, params));
        });
    };

    multi.charm = charm;
    multi.destroy = charm.destroy.bind(charm);
    
    multi.on = charm.on.bind(charm);
    multi.emit = charm.emit.bind(charm);
    multi.removeListener = charm.removeListener.bind(charm);
    multi.write = charm.write.bind(charm);
    
    (function () {
        var offset = 0;
        Object.defineProperty(multi, 'offset', {
            set : function (o) {
                offset = o;
                multi.emit('offset', o);
            },
            get : function () {
                return offset;
            }
        });
    })();
    
    return multi;
};
