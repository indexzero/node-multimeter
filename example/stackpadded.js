var multimeter = require('multimeter');

var multi = multimeter(process);
multi.on('^C', process.exit);
multi.charm.reset();
    
var bars = [];
var progress = [];
var deltas = [];
var s = [
  'beep',
  'beepboop',
  'boop',
  'sorryicant',
  'cantdothatdave'
];

var stack = multi(0, 1, {
  pad: true,
  type: 'stack',
  width : 20,
  solid : {
      text : '|',
      foreground : 'white',
      background : 'blue'
  },
  empty : { text : ' ' },
});

stack.push('Progress:');

for (var i = 0; i < 5; i++) {
    stack.push(s[i], 'bar');
    deltas[i] = 1 + Math.random() * 20;
    progress.push(0);
}

stack.push('beep boop');

var pending = progress.length;
var iv = setInterval(function () {
    progress.forEach(function (p, i) {
        progress[i] += Math.random() * deltas[i];
        stack.lines[s[i]].percent(progress[i]);
        if (p < 100 && progress[i] >= 100) {
            pending--;
        }

        if (pending === 0) {
            stack.push('All done.\n');
            multi.destroy();
            clearInterval(iv);
            pending --;
        }
    });
}, 100);
