var charmer = require('charm');
var Bar = require('./lib/bar');

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
    
    var multi = function (x, y, params) {
        if (typeof x === 'object') {
            params = x;
            x = params.x;
            y = params.y;
        }
        if (!params) params = {};
        
        if (x === undefined) x = '+0';
        if (y === undefined) y = '+0';
        
        var bar = new Bar(charm, x, y, params);
        multi.bars.push(bar);
        bar.offset = multi.offset;
        multi.on('offset', function (o) {
            bar.offset = o;
        });
        return bar;
    };
    multi.bars = [];
    
    multi.rel = function (x, y, params) {
        return multi(x, '-' + y, params);
    };
    
    multi.drop = function (params, cb) {
        if (!cb) { cb = params; params = {} }
        
        charm.position(function (x, y) {
            var bar = new Bar(charm, x, y, params);
            multi.bars.push(bar);
            multi.on('offset', function (o) {
                bar.offset = o;
            });
            cb(bar);
        });
    };
    
    multi.stack = function (params, cb) {
      if (!cb) { cb = params; params = {} }

      function stackbar(params_, cb_) {
          var x = multi._stack.x,
              y = ++multi._stack.y,
              bar = new Bar(charm, x, y, params_);

          multi._stack.bars.push(bar);
          multi.on('offset', function (o) {
              bar.offset = o;
          });
          cb_(bar);
      }

      if (!this._stack) {
        multi._stack = {
            pending: [{ params: params, cb: cb }],
            bars: []
        };

        charm.position(function (x, y) {
            multi._stack.x = x;
            multi._stack.y = y - 1;

            multi._stack.pending.forEach(function (info) {
                stackbar(info.params, info.cb);
            });
        });
        return;
      }
      else if (!multi._stack.x && !multi._stack.y) {
        multi._stack.pending.push({
            params: params,
            cb: cb
        });
        return;
      }

      stackbar(params, cb);
    }

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
