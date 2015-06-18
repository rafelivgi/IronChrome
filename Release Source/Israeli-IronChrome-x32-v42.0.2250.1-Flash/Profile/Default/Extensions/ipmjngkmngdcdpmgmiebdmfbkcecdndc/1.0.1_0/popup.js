(function() {
  function p(a) {
    var c, f = a.width, h = a.height;
    if ('toDataURL' === a.method) {
      c = document.createElement('img'), c.src = a.dataURL;
    } else {
      if ('getImageData' === a.method) {
        var b = document.createElement('canvas');
        b.width = f;
        b.height = h;
        var e = b.getContext('2d');
        c = a.args;
        var d = c[0], g = c[1], q = c[2], k = c[3], l = new Image;
        l.onload = function() {
          function a(b) {
            e.clearRect(0, 0, f, h);
            e.drawImage(l, 0, 0);
            b && (e.strokeStyle = 'black', e.lineWidth = 1, e.rect(d - .5, g - .5, .5 + q + .5, .5 + k + .5), e.stroke());
          }
          a(!1);
          b.addEventListener('mouseenter', function() {
            a(!0);
          });
          b.addEventListener('mouseleave', function() {
            a(!1);
          });
        };
        l.src = a.dataURL;
        c = b;
      }
    }
    return c;
  }
  var r = function() {
    var a = document.createElement('a');
    return function(c) {
      a.href = c;
      return a.protocol + '//' + a.hostname;
    };
  }(), m = parseInt(location.hash.substring(1), 10), n = chrome.extension.getBackgroundPage().blocksByTabId[m], s = document.getElementById('list'), t = document.getElementById('subtitle');
  document.getElementById('donate-anchor').addEventListener('click', function() {
    chrome.tabs.get(m, function(a) {
      chrome.tabs.create({url:'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=canvas%2efingerprint%2eblock%40gmail%2ecom&lc=MT&item_name=Support%20development%20of%20CanvasFingerprintBlock%20Chrome%20extension&item_number=popup&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted', index:a.index + 1});
    });
  });
  var k = n.length;
  t.innerHTML = 1 === k ? 'Blocked <span class=amount>' + k + '</span> potential HTML canvas fingerprinting attempt on this page' : 'Blocked <span class=amount>' + k + '</span> potential HTML canvas fingerprinting attempts on this page';
  n.forEach(function(a) {
    var c = r(a.url), f = a.width, h = a.height, b = a.args, e = a.method, d = f + 'px\u00a0\u00d7\u00a0' + h + 'px';
    a = p(a);
    a.title = d;
    var g;
    if ('toDataURL' === e || 'getImageData' === e && 0 === b[0] && 0 === b[1] && b[2] === f && b[3] === h) {
      g = 'Prevented a script on ' + c + ' from capturing the following ' + d + ' canvas:';
    } else {
      if ('getImageData' === e) {
        g = b[0];
        var f = b[1], h = b[2], b = b[3], e = g + h - 1, k = f + b - 1;
        g = 'Prevented a script on ' + c + ' from capturing ' + (1 === h && 1 === b ? 'the point (' + g + ',\u00a0' + f + ') on the following ' + d + ' canvas' : 1 === h || 1 === b ? 'the strip from (' + g + ',\u00a0' + f + ') to (' + e + ',\u00a0' + k + ') of the following ' + d + ' canvas' : 'the rectangular area between (' + g + ',\u00a0' + f + ') and (' + e + ',\u00a0' + k + ') of the following ' + d + ' canvas') + ':';
      }
    }
    c = document.createElement('li');
    d = document.createElement('div');
    d.textContent = g;
    c.appendChild(d);
    d = document.createElement('div');
    d.className = 'img-container';
    d.appendChild(a);
    c.appendChild(d);
    s.appendChild(c);
  });
})();

