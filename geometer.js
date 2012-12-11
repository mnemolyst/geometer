var SNAP_DISTANCE = 10;

function sq(x) {
  return x * x;
}

function sgn(x) {
  return x < 0 ? -1 : 1;
}

function sign(x) {
  return x < 0 ? -1 : x == 0 ? 0 : 1;
}

function circle(x, y, r) {
  if (r == 0)
    return false;

  this.x = parseFloat(x);
  this.y = parseFloat(y);
  this.r = parseFloat(r);

  this.intersect_circle = function(c) {
    // http://2000clicks.com/mathhelp/GeometryConicSectionCircleIntersection.aspx
    var d2 = sq(c.x-this.x) + sq(c.y-this.y);
    var ra2 = sq(this.r);
    var rb2 = sq(c.r);
    var k = 0.25*Math.sqrt((sq(this.r+c.r)-d2) * (d2-sq(this.r-c.r)));
    if (isNaN(k))
      return null;

    var ixp1 = 0.5*(c.x+this.x) + 0.5*(c.x-this.x)*(ra2-rb2)/d2;
    var ixp2 = 2*k*(c.y-this.y)/d2;
    var iyp1 = 0.5*(c.y+this.y) + 0.5*(c.y-this.y)*(ra2-rb2)/d2;
    var iyp2 = -2*k*(c.x-this.x)/d2;

    return [[ixp1+ixp2, iyp1+iyp2], [ixp1-ixp2, iyp1-iyp2]];
  }

  this.intersect_line = function(l) {
    // http://mathworld.wolfram.com/Circle-LineIntersection.html
    var x1 = l.x1 - this.x;
    var y1 = l.y1 - this.y;
    var x2 = l.x2 - this.x;
    var y2 = l.y2 - this.y;

    var dx = x2 - x1;
    var dy = y2 - y1;
    var dr2 = sq(dx) + sq(dy);
    var D = x1*y2-x2*y1;

    var sqrtdisc = Math.sqrt(sq(this.r)*dr2 - sq(D));
    if (sqrtdisc < 0)
      return Array();
    else if (sqrtdisc == 0) {
      var x = D*dy/dr2;
      var y = -D*dx/dr2;
      return Array([x,y]);
    } else {
      var x1 = (D*dy + sgn(dy)*dx*sqrtdisc)/dr2;
      var y1 = (-D*dx + Math.abs(dy)*sqrtdisc)/dr2;
      var x2 = (D*dy - sgn(dy)*dx*sqrtdisc)/dr2;
      var y2 = (-D*dx - Math.abs(dy)*sqrtdisc)/dr2;

      return Array([x1+this.x, y1+this.y],[x2+this.x, y2+this.y]);
    }
  }
} // circle

function line(x1, y1, x2, y2) {
  if (x1 == x2 && y1 == y2)
    return false;

  this.x1 = parseFloat(x1);
  this.y1 = parseFloat(y1);
  this.x2 = parseFloat(x2);
  this.y2 = parseFloat(y2);

  this.intersect_line = function(l) {
    var denom = (this.x1-this.x2)*(l.y1-l.y2) - (this.y1-this.y2)*(l.x1-l.x2);
    if (denom == 0)
      //alert('zerodenom' + l.x1 + ' ' + l.y1 + ' ' + l.x2 + ' ' + l.y2);
      return null;

    var d3 = d1*(l.x1-l.x2) - d2*(this.x1-this.x2);
    var d1 = this.x1*this.y2 - this.x2*this.y1;
    var d2 = l.x1*l.y2 - l.x2*l.y1;
    var d3 = d1*(l.x1-l.x2) - d2*(this.x1-this.x2);
    var d4 = d1*(l.y1-l.y2) - d2*(this.y1-this.y2);

    return [d3/denom, d4/denom];
  }

  this.dist_to_point = function(p) {
    var cp = (this.x2 - this.x1)*(this.y1 - p[1]) - (this.y2 - this.y1)*(this.x1 - p[0]);
    var dx = this.x2 - this.x1;
    var dy = this.y2 - this.y1;
    var dp = sq(dx) + sq(dy);
    return Math.abs(cp / Math.sqrt(dp));
  }

  this.signed_dist_to_point = function(p) { // positive distance for points below 'this', negative otherwise
    var cp = (this.x2 - this.x1)*(this.y1 - p[1]) - (this.y2 - this.y1)*(this.x1 - p[0]);
    var dx = this.x2 - this.x1;
    var dy = this.y2 - this.y1;
    var dp = sq(dx) + sq(dy);
    return cp / Math.sqrt(dp);
  }

  this.project_point = function(p) {
    var x = [p[0] - this.x1, p[1] - this.y1];             // vector from [this.x1, this.y1] to p
    var orth_r = [this.y2 - this.y1, this.x1 - this.x2];  // vector r: 'this' rotated 90 deg ccw
    var len_r = Math.sqrt(sq(orth_r[0]) + sq(orth_r[1])); // length of r
    var coef = this.signed_dist_to_point(p) / len_r;
    var d = [coef * orth_r[0], coef * orth_r[1]];         // d = shortest vector from 'this' to p
    return [p[0] - d[0], p[1] - d[1]];
  }

  this.fit_box = function(l1, l2, l3, l4) { //limits left, right, bottom, and top
    var ll = (l1 < l2) ? l1 : l2;
    var lr = (l1 < l2) ? l2 : l1;
    var lb = (l3 < l4) ? l3 : l4;
    var lt = (l3 < l4) ? l4 : l3;
    var scale = (Math.abs(this.x2 - this.x1) + Math.abs(this.y2 - this.y1)) / 2;
    var lim_left = new line(ll, 0, ll, scale);
    var lim_right = new line(lr, 0, lr, scale);
    var lim_bottom = new line(0, lb, scale, lb);
    var lim_top = new line(0, lt, scale, lt);

    var intercepts = Array(
      this.intersect_line(lim_left),
      this.intersect_line(lim_right),
      this.intersect_line(lim_bottom),
      this.intersect_line(lim_top)
    );

    for(i=0; i<intercepts.length; i++) {
      if (intercepts[i] !== null) {
        //alert(intercepts[i][0] + ' ' + intercepts[i][1]);
      }
    }

    var p = Array();

    // FIXME reliably select only two intercepts that will make a valid line, if possible
    if (intercepts[0] !== null && intercepts[0][1] >= lb && intercepts[0][1] <= lt) {
      p.push( [ll, intercepts[0][1]] );
      //alert('0');
    }
    if (intercepts[1] !== null && intercepts[1][1] >= lb && intercepts[1][1] <= lt) {
      p.push( [lr, intercepts[1][1]] );
      //alert('1');
    }
    if (intercepts[2] !== null && intercepts[2][0] >= ll && intercepts[2][0] <= lr) {
      p.push( [intercepts[2][0], lb] );
      //alert('2');
    }
    if (intercepts[3] !== null && intercepts[3][0] >= ll && intercepts[3][0] <= lr) {
      p.push( [intercepts[3][0], lt] );
      //alert('3');
    }

    //alert('count ' + p.length);

    if (p.length == 2) {
      return new line(p[0][0], p[0][1], p[1][0], p[1][1]);
    } else {
      return null;
    }
  }
} // line

function region(canvas, left, top, scale) {
  this.canvas = jQuery(canvas);
  this.ctx = canvas.getContext("2d");
  this.left = left;
  this.top = top;
  this.scale = scale;
  this.circles = Array();
  this.lines = Array();
  this.paths = Array(Array());
  this.snappoints = Array([0, 0]);
  this.repeat_box = [600, 600];
  this.repeat = false;

  this.point_to_pixel = function(p) {
    var px = (p[0] - this.left) * this.scale;
    var py = (this.top - p[1]) * this.scale;
    return [px, py];
  }

  this.pixel_to_point = function(p) {
    var px = (p[0] / this.scale) + this.left;
    var py = -(p[1] / this.scale) + this.top;
    return [px, py];
  }

  this.scale_to_screen = function(d) {
    return d * this.scale;
  }

  this.scale_from_screen = function(d) {
    return d / this.scale;
  }

  // this works because the repeat box is always centered around the origin
  this.fit_repeat_box = function(p) {
    while (p[0] < -this.repeat_box[0]/2 || p[0] > this.repeat_box[0]/2)
      p[0] -= this.repeat_box[0] * sign(p[0]);
    while (p[1] < -this.repeat_box[1]/2 || p[1] > this.repeat_box[1]/2)
      p[1] -= this.repeat_box[1] * sign(p[1]);
    return p;
  }

  this.extend_line = function(l) {
    var dx = l.x2 - l.x1;
    var dy = l.y2 - l.y1;
    var right = this.left + this.scale_from_screen(this.canvas.width());
    var bottom = this.top - this.scale_from_screen(this.canvas.height());
    
    if (dx == 0) {
      return new line(l.x1, bottom, l.x2, this.top);
    } else if (dy == 0) {
      return new line(this.left, l.y1, right, l.y2);
    } else {
      var m = dy/dx;
      var ny1 = l.y1 + m*(this.left - l.x1);
      var ny2 = l.y1 + m*(right - l.x1);
      return new line(this.left, ny1, right, ny2);
    }
  }

  this.draw_point = function(p) {
    var sp = this.point_to_pixel(p);
    this.ctx.strokeStyle = '000000';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(sp[0]-1, sp[1]-1, 3, 3);
  }

  this.draw_circle = function(circ, width, color) {
    width = typeof width !== 'undefined' ? width : 1;
    color = typeof color !== 'undefined' ? color : '000000';
    var c = this.point_to_pixel([circ.x, circ.y]);
    var r = this.scale_to_screen(circ.r);

    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.arc(c[0], c[1], r, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  this.draw_line = function(l, width, color) {
    if (!l) return;
    width = typeof width !== 'undefined' ? width : 1;
    color = typeof color !== 'undefined' ? color : '000000';

    var p1 = this.point_to_pixel([l.x1, l.y1]);
    var p2 = this.point_to_pixel([l.x2, l.y2]);

    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.moveTo(p1[0], p1[1]);
    this.ctx.lineTo(p2[0], p2[1]);
    this.ctx.stroke();
  }

  this.draw_line_segment = function(l, width, color) {
    width = typeof width !== 'undefined' ? width : 1;
    color = typeof color !== 'undefined' ? color : '000000';
    var p1 = this.point_to_pixel([l.x1, l.y1]);
    var p2 = this.point_to_pixel([l.x2, l.y2]);

    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.moveTo(p1[0], p1[1]);
    this.ctx.lineTo(p2[0], p2[1]);
    this.ctx.stroke();
  }

  this.draw_path = function(p, width, color, offset) {
    width = typeof width !== 'undefined' ? width : 1;
    color = typeof color !== 'undefined' ? color : '000000';
    offset = typeof offset !== 'undefined' ? offset : [0, 0];
    for (var i=0; i<p.length-1; i++) {
      var l = new line(p[i][0] + offset[0], p[i][1] + offset[1], p[i+1][0] + offset[0], p[i+1][1] + offset[1]);
      this.draw_line_segment(l, width, color);
    }
  }

  this.draw_origin = function() {
    var o = this.point_to_pixel([0, 0]);
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'FF0000';
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(o[0]-4, o[1]);
    this.ctx.lineTo(o[0]+4, o[1]);
    this.ctx.moveTo(o[0], o[1]-4);
    this.ctx.lineTo(o[0], o[1]+4);
    this.ctx.stroke();
  }

  this.draw_rect = function(x1, y1, w, h) {
    var p1 = this.point_to_pixel([x1, y1]);
    this.ctx.strokeStyle = '000000';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(p1[0], p1[1], this.scale_to_screen(w), this.scale_to_screen(h));
  }

  this.draw_all = function() {
    if (this.repeat) {
      for (var i=-1; i<=1; i++) {
        for (var j=-1; j<=1; j++) {
          var is_center = (i==0 && j==0);
          var offset = is_center ? [0, 0] : [this.repeat_box[0] * i, this.repeat_box[1] * j];
          var color = is_center ? '000000' : '999999';

          for (var k=0; k<this.circles.length; k++) {
            var a = this.circles[k];
            var b = is_center ? a : new circle(a.x + offset[0], a.y + offset[1], a.r);
            this.draw_circle(b, 1, color);
          }
          for (var k=0; k<this.lines.length; k++) {
            var a = this.lines[k];
            var b = is_center ? a : new line(a.x1 + offset[0], a.y1 + offset[1], a.x2 + offset[0], a.y2 + offset[1]);
            var c = b.fit_box(-this.repeat_box[0] / 2 + offset[0], this.repeat_box[0] / 2 + offset[0], -this.repeat_box[1] / 2 + offset[1], this.repeat_box[1] / 2 + offset[1]);
            this.draw_line(c, 1, color);
          }
          for (var k=0; k<this.paths.length; k++) {
            this.draw_path(this.paths[k], 2, color, offset);
          }
        }
      }
    } else {
      for (var i=0; i<this.circles.length; i++) {
        this.draw_circle(this.circles[i]);
      }
      for (var i=0; i<this.lines.length; i++) {
        var el = this.lines[i].fit_box(this.left, this.left + this.scale_from_screen(this.canvas.width()), this.top - this.scale_from_screen(this.canvas.height()), this.top);
        this.draw_line(el);
      }
      for (var i=0; i<this.paths.length; i++) {
        this.draw_path(this.paths[i], 2);
      }
    }
  }

  this.redraw = function() {
    this.ctx.clearRect(0, 0, this.canvas.width(), this.canvas.height());
    this.draw_all();
  }

  this.regen_snappoints = function() {
    this.snappoints = Array([0, 0]);

    for (var i=0; i<this.circles.length; i++) {
      for (var j=i+1; j<this.circles.length; j++) {
        ps = this.circles[i].intersect_circle(this.circles[j]);

        if (ps != null) {
          this.snappoints.push(ps[0]);
          this.snappoints.push(ps[1]);
        }
      }

      for (var j=0; j<this.lines.length; j++) {
        ps = this.circles[i].intersect_line(this.lines[j]);
        for (var k=0; k<ps.length; k++) {
          this.snappoints.push(ps[k]);
        }
      }
    }

    for (var i=0; i<this.lines.length; i++) {
      for (var j=i+1; j<this.lines.length; j++) {
        p = this.lines[i].intersect_line(this.lines[j]);
        if (p != null) {
          this.snappoints.push(p);
        }
      }
    }
  }
} // region

jQuery(document).ready(function($) {
  var baseCanvas = $('#baseCanvas');
  var offset = baseCanvas.offset();
  var r = new region(baseCanvas[0], -300, 300, 1);
  var state = 'none'; //none, FIXME** point_picked **FIXME, delete_which, repeat_where, snap_to, zoom_which, alert_next_key
  var draw = 'circles';
  var cursor_at = null;
  var symmetry = null;
  var point_picked = false;

  var canvas_click = function(p) {
    if (point_picked == true) {
      switch (draw) {
        case 'circles':
          state = 'none';
          point_picked = false;
          cr = Math.sqrt(sq(p[0] - r.mempoint[0]) + sq(p[1] - r.mempoint[1]));
          c = new circle(r.mempoint[0], r.mempoint[1], cr);
          if (c)
            r.circles.push(c);
          break;
        case 'lines':
          state = 'none';
          point_picked = false;
          //alert(r.mempoint[0] + ' ' + r.mempoint[1] + ' ' + p[0] + ' ' + p[1]);
          l = new line(r.mempoint[0], r.mempoint[1], p[0], p[1]);
          if (l)
            r.lines.push(l);
          break;
        case 'path':
          break;
      }

      r.redraw();
      r.regen_snappoints();
    } else {
      if (draw == 'path') {
        var curpath = r.paths.length - 1;
        var lastpoint = r.paths[curpath].length - 1;
        if (r.paths[curpath].length == 0 || (p[0] != r.paths[curpath][lastpoint][0] || p[1] != r.paths[curpath][lastpoint][1])) {
          r.paths[curpath].push(p);
          r.redraw();
        }
      } else {
        point_picked = true;
        r.mempoint = p;
        r.draw_point(p);
      }
    }
  };

  var stdin_write = function(s) {
    var newval = $('#stdin').val() + String(s);
    $('#stdin').val(newval);
    return newval;
  }

  var get_two_n = function() {
    var val1 = parseFloat($('#stdin').val());
    var val2 = parseFloat($('#mem1').val());
    if (val1 && val2)
      return [val1, val2];
    else
      return false;
  }

  $('#baseCanvas').click(function(event) {
    var px = event.clientX - offset.left;
    var py = event.clientY - offset.top;
    var p = r.pixel_to_point([px, py]);

    if (cursor_at != null) {
      var smldst = r.scale_from_screen(SNAP_DISTANCE) + 1;
      var snap_to = null;
      for (var i=0; i<r.snappoints.length; i++) {
        var dist = Math.abs(r.snappoints[i][0] - cursor_at[0]) + Math.abs(r.snappoints[i][1] - cursor_at[1]);
        if ((dist <= r.scale_from_screen(SNAP_DISTANCE)) && (dist < smldst)) {
          smldst = dist;
          snap_to = i;
        }
      }
      if (snap_to == null) {
        canvas_click(p);
      } else {
        canvas_click(r.snappoints[snap_to]);
      }
    }
  });

  $(document).keydown(function(event) {
    if (state == 'alert_next_key') {
      state = 'none';
      alert(event.which);
    }

    switch(event.which) {
      case 8:                                       //'backspace'
        var curval = $('#stdin').val();
        $('#stdin').val(curval.substr(0, curval.length - 1));
        event.stopImmediatePropagation();
        break;
      case 9:                                       //'tab'
        break;
      case 13:                                      //'enter'
        if (event.shiftKey && ($('#stdin').val() != '')) {
          $('#mem4').val($('#mem3').val());
          $('#mem3').val($('#mem2').val());
          $('#mem2').val($('#mem1').val());
          $('#mem1').val($('#stdin').val());
          $('#stdin').val('');
          break;
        }
        if (point_picked == true) {
          if (isNaN(parseFloat($('#stdin').val())))
            break;

          switch (draw) {
            case 'circles':
              state = 'none';
              point_picked = false;
              c = new circle(r.mempoint[0], r.mempoint[1], $('#stdin').val());
              if (c)
                r.circles.push(c);
              r.redraw();
              r.regen_snappoints();
              break;
            case 'lines':
              state = 'none';
              point_picked = false;
              rad = $('#stdin').val() * Math.PI / 180;
              v = [Math.cos(rad), Math.sin(rad)];
              l = new line(r.mempoint[0], r.mempoint[1], r.mempoint[0] + v[0], r.mempoint[1] + v[1]);
              if (l)
                r.lines.push(l);
              r.redraw();
              r.regen_snappoints();
              break;
          }
        }
        break;
      case 27:                                      //'esc'
        if ($('#stdin').val() != '') {
          $('#stdin').val('');
        } else {
          state = 'none';
          if (r.paths[r.paths.length - 1].length > 0) {
            r.paths.push(Array());
          }
          r.redraw();
        }
        break;
      case 37:                                      //left arrow
        r.left -= r.scale_from_screen(10);
        r.redraw();
        break;
      case 38:                                      //up arrow
        r.top += r.scale_from_screen(10);
        r.redraw();
        break;
      case 39:                                      //right arrow
        r.left += r.scale_from_screen(10);
        r.redraw();
        break;
      case 40:                                      //down arrow
        r.top -= r.scale_from_screen(10);
        r.redraw();
        break;
      case 46:                                      //'delete'
        var curval = $('#stdin').val();
        $('#stdin').val(curval.substr(0, curval.length - 1));
        event.stopImmediatePropagation();
        break;
      case 48:                                      //'0'
        if (state == 'zoom_which') {
          state = 'none';
          r.left = -300;
          r.top = 300;
          r.scale = 1;
          r.redraw();
          break;
        }
      case 56:                                      //'8'
        if (event.shiftKey) {
          var vals = get_two_n();
          if (vals) {
            $('#stdin').val(vals[0] * vals[1]);
            $('#mem1').val($('#mem2').val());
            $('#mem2').val($('#mem3').val());
            $('#mem3').val($('#mem4').val());
            break;
          }
        }
      case 56: case 49: case 50: case 51: case 52:  //'0'-'4'
      case 53: case 54: case 55: case 56: case 57:  //'5'-'9'
        stdin_write(String(event.which - 48));
        break;
      case 67:                                      //'c'
        //TODO make a switch to catch all state cases. should be able to switch to circles without losing point_picked
        if (state == 'none') {
          $('#draw_circles').click();
        } else if (cursor_at != null) {
          var smldst = r.scale_from_screen(SNAP_DISTANCE) + 1;
          var snap_to = null;
          for (var i=0; i<r.circles.length; i++) {
            var c_dist = Math.sqrt(sq(r.circles[i].x - cursor_at[0]) + sq(r.circles[i].y - cursor_at[1]));
            var dist = Math.abs(c_dist - r.circles[i].r);
            if ((dist <= r.scale_from_screen(SNAP_DISTANCE)) && (dist < smldst)) {
              smldst = dist;
              snap_to = i;
            }
          }
          if (snap_to != null) {
            if (state == 'delete_which') {
              state = 'none';
              r.circles.splice(snap_to, 1);
              r.redraw();
            } else {
              state = 'none';
              canvas_click([r.circles[snap_to].x, r.circles[snap_to].y]);
            }
          }
        }
        break;
      case 68:                                      //'d'
        state = 'delete_which';
        break;
      case 69:                                      //'e'
        break;
      case 72:                                      //'h'
        if (point_picked == true && draw == 'lines') {
          state = 'none';
          point_picked = false;
          l = new line(r.mempoint[0], r.mempoint[1], r.mempoint[0] + 1, r.mempoint[1]); //make a horizontal line
          r.lines.push(l);
          r.redraw();
          r.regen_snappoints();
        } else if (state == 'repeat_where') { //set 'h'eight of the repeat box
          state = 'none';
          if (! isNaN(parseFloat($('#stdin').val()))) {
            r.repeat_box[1] = parseFloat($('#stdin').val());
            r.redraw();
            r.draw_rect(-r.repeat_box[0]/2, r.repeat_box[1]/2, r.repeat_box[0], r.repeat_box[1]);
          }
        }
        break;
      case 73:                                      //'i'
        if (state == 'zoom_which' && cursor_at != null) {
          state = 'none';
          var new_left = (cursor_at[0] + r.left) / 2;
          var new_top = (cursor_at[1] + r.top) / 2;
          r.left = new_left;
          r.top = new_top;
          r.scale *= 2;
          r.redraw();
        }
        break;
      case 76:                                      //'l'
        //TODO switch for all states
        if (state == 'none') {
          $('#draw_lines').click();
        } else if (cursor_at != null) {
          var smldst = r.scale_from_screen(SNAP_DISTANCE) + 1;
          var snap_to = null;
          for (var i=0; i<r.lines.length; i++) {
            var dist = r.lines[i].dist_to_point(cursor_at);
            if ((dist <= r.scale_from_screen(SNAP_DISTANCE)) && (dist < smldst)) {
              smldst = dist;
              snap_to = i;
            }
          }
          if (snap_to != null) {
            if (state == 'delete_which') {
              r.lines.splice(snap_to, 1);
              r.redraw();
            } else {
              state = 'none';
              canvas_click(r.lines[snap_to].project_point(cursor_at));
            }
          }
          state = 'none';
        }
        break;
      case 79:                                      //'o'
        if (state == 'zoom_which' && cursor_at != null) {
          state = 'none';
          var new_left = r.left * 2 - cursor_at[0];
          var new_top = r.top * 2 - cursor_at[1];
          r.left = new_left;
          r.top = new_top;
          r.scale /= 2;
          r.redraw();
        } else {
          r.draw_origin();
        }
        break;
      case 80:                                      //'p'
        switch (state) {
          case 'none':
            $('#draw_path').click();
            break;
          case 'delete_which':
            
        }
        break;
      case 82:                                      //'r'
        if (state == 'repeat_where') {
          state = 'none';
          r.repeat = !r.repeat;
          r.redraw();
        } else {
          state = 'repeat_where';
          r.redraw();
          r.draw_rect(-r.repeat_box[0]/2, r.repeat_box[1]/2, r.repeat_box[0], r.repeat_box[1]);
        }
        break;
      case 83:                                      //'s'
        state = 'snap_to'; //FIXME overwrites 'point_picked'
        //var str = JSON.stringify(r); // TODO save function
        //alert(str);
        //jQuery.ajax({
        //  url: 'save.php',
        //  data: str,
        //  complete: function(jqHXR, testStatus) {
        //    alert(testStatus);
        //  },
        //});
        break;
      case 86:                                      //'v'
        if (point_picked == true && draw == 'lines') {
          state = 'none';
          point_picked = false;
          l = new line(r.mempoint[0], r.mempoint[1], r.mempoint[0], r.mempoint[1] + 1); //make a vertical line
          r.lines.push(l);
          r.redraw();
          r.regen_snappoints();
        } else if (state == 'repeat_where') { //set 'v'ertical dimension of the repeat box
          state = 'none';
          if (! isNaN(parseFloat($('#stdin').val()))) {
            r.repeat_box[1] = parseFloat($('#stdin').val());
            r.draw_rect(-r.repeat_box[0]/2, r.repeat_box[1]/2, r.repeat_box[0], r.repeat_box[1]);
          }
        }
        break;
      case 87:                                      //'w'
        if (state == 'repeat_where') { //set 'w'idth of the repeat box
          state = 'none';
          if (! isNaN(parseFloat($('#stdin').val()))) {
            r.repeat_box[0] = parseFloat($('#stdin').val());
            r.redraw();
            r.draw_rect(-r.repeat_box[0]/2, r.repeat_box[1]/2, r.repeat_box[0], r.repeat_box[1]);
          }
        }
        break;
      case 90:                                      //'z'
        state = 'zoom_which';
        break;
      case 173:                                     //'-'
        stdin_write('-');
        break;
      case 190:                                     //'.'
        stdin_write('.');
        break;
      case 191:                                     //'/'
        break;
      case 192:                                     //'`'
        if (event.shiftKey) {
          state = 'alert_next_key';
        } else {
          var output = 'state: ' + state + '\n';
          output += 'repeat: ' + r.repeat + '\n';
          output += 'point_picked: ' + point_picked + '\n';
          alert(output);
        }
        break;
      case 220:                                     //'\'
        var curval = $('#stdin').val();
        if (! isNaN(parseFloat(curval)))
          $('#stdin').val(Math.sqrt(curval));
        break;
    }
  });

  $('#baseCanvas').mousemove(function(event) {
    var px = event.clientX - offset.left;
    var py = event.clientY - offset.top;
    var p = r.pixel_to_point([px, py]);
    cursor_at = p;
  });

  $('#draw_circles').click(function() {
    draw = 'circles';
    $(this).addClass('selected').removeClass('non-selected');
    $('#draw_lines').addClass('non-selected').removeClass('selected');
    $('#draw_path').addClass('non-selected').removeClass('selected');
  });

  $('#draw_lines').click(function() {
    draw = 'lines';
    $(this).addClass('selected').removeClass('non-selected');
    $('#draw_circles').addClass('non-selected').removeClass('selected');
    $('#draw_path').addClass('non-selected').removeClass('selected');
  });

  $('#draw_path').click(function() {
    draw = 'path';
    $(this).addClass('selected').removeClass('non-selected');
    $('#draw_lines').addClass('non-selected').removeClass('selected');
    $('#draw_circles').addClass('non-selected').removeClass('selected');
  });

  $('#clear_all').click(function() {
    r.circles = Array();
    r.lines = Array();
    r.paths = Array(Array());
    r.snappoints = Array([0, 0]);
    r.redraw();
    state = 'none';
  });
});
