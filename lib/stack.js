var Bar = require('./bar');

var Stack = module.exports = function (charm, x, y, params) {
    this.charm = charm;
    this.x = x;
    this.y = this.start = y;
    this.width = params.width || 10;
    this.offset = params.offset || 0;
    this.pad = params.pad || false;
    this.before = params.before || '[';
    this.after = params.after || '] ';

    this.solid = params.solid || {
        background : 'blue',
        foreground : 'white',
        text : '|'
    };

    this.empty = params.empty || {
        background : null,
        foreground : null,
        text : ' '
    };

    this.stack = [];
    this.lines = {};
    this.prefix = 0;
    this.progress = {
        percent : 0,
        ratio : 0
    };
}

Stack.prototype.push = function (text, params) {
    var padding = ' ',
        line;

    if (!params) {
        this.charm.position(this.x, this.y);
        this.charm.write(text);
        line = this.lines[text] = {
            y: this.y,
            text: text,
            length: text.length
        };
    }
    else {
        if (this.pad) {
            if (text.length > this.prefix) {
                this.prefix = text.length;
            }
            else {
                padding = new Array(this.prefix - text.length + 2).join(' ');
            }
        }
        
        line = this.lines[text] = new Bar(this.charm, this.x, this.y, {
            prefix: text + padding,
            before: this.before,
            after: this.after,
            width: params.width || this.width,
            offset: params.offset || this.offset,
            solid: params.solid || this.solid,
            empty: params.empty || this.empty
        });
    }

    this.y++;
    this.stack.push(text);
    return line;
};

Stack.prototype.splice = function (text) {
    if (!this.lines[text]) {
        throw new Error('Invalid line: ' + text);
    }

    var self = this;
    var offset = this.stack.indexOf(text);

    this.draw(offset + 1);
    this.y--;
    this.stack.splice(offset, 1);
    return true;
};

Stack.prototype.clear = function () {
    var self = this;
    this.stack.forEach(function (s) {
        var line = self.lines[s];
        self.charm
            .position(0, line.y)
            .write(Array(line.length + 1).join(' '))
            .display('reset');
        delete self.lines[s];
    });

    this.stack.length = 0;
    this.charm.position(0, this.start);
}

Stack.prototype.draw = function (start) {
    var self = this;
    start = start || 0;

    this.stack.slice(start).forEach(function (s, i) {
        var prev = self.lines[self.stack[start + i - 1]],
            line = self.lines[s];

        self.charm
            .position(0, line.y)
            .write(Array(line.length + 1).join(' '))
            .display('reset');

        line.y--;

        if (prev) {
            self.charm
                .position(self.x, line.y)
                .write(Array(prev.length + 1).join(' '))
                .display('reset');
        }

        if (line.text) {
            self.charm
                .position(self.x, line.y)
                .write(line.text);
        }

        self.charm.position(self.x, line.y + 1);
    });
};

Object.defineProperty(Stack.prototype, 'prefix', {
    get : function () {
        return this._prefix;
    },
    set : function (p) {
        var self = this;
        this._prefix = p;
        this.stack.forEach(function (text) {
            var line = self.lines[text];
            if (line.prefix) {
                line.prefix = text + new Array(p - text.length + 2).join(' ');
            }
        });
    }
});