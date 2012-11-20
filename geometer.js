var SNAP_DISTANCE = 10;

function sq(x) {
  return x*x;
}

function sgn(x) {
  return x < 0 ? -1 : 1;
}

function sign(x) {
  return x < 0 ? -1 : x == 0 ? 0 : 1;
}

function circle(x, y, r) {
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
} // line

function region(canvas, left, top, scale) {
  this.canvas = jQuery(canvas);
  this.ctx = canvas.getContext("2d");
  this.left = left;
  this.top = top;
  this.scale = scale;
  this.circles = Array();
  this.lines = Array();
  this.snappoints = Array();

  // point (0, 0) is the lower left corner
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
    this.ctx.strokeRect(sp[0]-1, sp[1]-1, 3, 3);
  }

  this.draw_circle = function(circ, width) {
    width = typeof width !== 'undefined' ? width : 1;
    var c = this.point_to_pixel([circ.x, circ.y]);
    var r = this.scale_to_screen(circ.r);

    this.ctx.beginPath();
    this.ctx.lineWidth = width;
    this.ctx.arc(c[0], c[1], r, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  this.draw_line = function(l, width) {
    width = typeof width !== 'undefined' ? width : 1;
    el = this.extend_line(l);
    var p1 = this.point_to_pixel([el.x1, el.y1]);
    var p2 = this.point_to_pixel([el.x2, el.y2]);

    this.ctx.beginPath();
    this.ctx.lineWidth = width;
    this.ctx.moveTo(p1[0], p1[1]);
    this.ctx.lineTo(p2[0], p2[1]);
    this.ctx.stroke();
  }

  this.draw_snappoint = function(i) {
    this.draw_point(this.snappoints[i]);
  }

  this.draw_snap_circle_center = function(i) {
    this.draw_point(this.circles[i][0]);
  }

  this.draw_snap_circle_circumference = function(i) {
    this.draw_circle(this.circles[i], 3);
  }

  this.draw_snap_line = function(i) {
    this.draw_line(this.lines[i], 3);
  }

  this.erase_snap = function() {
    this.redraw(); //FIXME
  }

  this.clear = function() {
    this.ctx.fillStyle = "rgb(255, 255, 255)";
    this.ctx.fillRect(0, 0, this.canvas.width(), this.canvas.height());
  }

  this.draw_all = function() {
    for (i=0; i<this.circles.length; i++) {
      this.draw_circle(this.circles[i]);
    }
    for (i=0; i<this.lines.length; i++) {
      this.draw_line(this.lines[i]);
    }
  }

  this.redraw = function() {
    this.clear();
    this.draw_all();
  }

  this.regen_snappoints = function() {
    this.snappoints = Array();

    for (i=0; i<this.circles.length; i++) {
      for (j=i+1; j<this.circles.length; j++) {
        ps = this.circles[i].intersect_circle(this.circles[j]);

        if (ps != null) {
          this.snappoints.push(ps[0]);
          this.snappoints.push(ps[1]);
        }
      }

      for (j=0; j<this.lines.length; j++) {
        ps = this.circles[i].intersect_line(this.lines[j]);
        for (k=0; k<ps.length; k++) {
          this.snappoints.push(ps[k]);
        }
      }
    }

    for (i=0; i<this.lines.length; i++) {
      for (j=i+1; j<this.lines.length; j++) {
        p = this.lines[i].intersect_line(this.lines[j]);
        if (p != null) {
          this.snappoints.push(p);
        }
      }
    }

    //for (i=0; i<this.snappoints.length; i++) {
    //  this.draw_point(this.snappoints[i][0]);
    //}
  }
} // region

jQuery(document).ready(function($) {
  var baseCanvas = $('#baseCanvas');
  var r = new region(baseCanvas[0], 0, 600, 1);
  var state = ['none', 'none'];
  var draw = 'circles';
  var snap_to = null;
  var offset = baseCanvas.offset();
  var cursor_at = null;
  var shownext = false;

  canvas_click = function(p) {
    switch (state[0]) {
      case 'none':
        state[0] = 'point_picked';
        r.mempoint = p;
        r.draw_point(p);
        break;
      case 'point_picked':
        switch (draw) {
          case 'circles':
            state[0] = 'none';

            cr = Math.sqrt(sq(p[0] - r.mempoint[0]) + sq(p[1] - r.mempoint[1]));

            c = new circle(r.mempoint[0], r.mempoint[1], cr);
            r.circles.push(c);

            break;
          case 'lines':
            state[0] = 'none';

            l = new line(r.mempoint[0], r.mempoint[1], p[0], p[1]);
            if (l)
              r.lines.push(l);
            break;
        }

        r.redraw();
        r.regen_snappoints();
        break;
    }
  };

  stdin_write = function(s) {
    var newval = $('#stdin').val() + String(s);
    $('#stdin').val(newval);
    return newval;
  }

  $('#baseCanvas').click(function(event) {
    var px = event.clientX - offset.left;
    var py = event.clientY - offset.top;
    var p = r.pixel_to_point([px, py]);

    canvas_click(p);
  });

  $(document).keydown(function(event) {
    if (shownext)
      (shownext = false) || alert(event.which);

    switch(event.which) {
      case 9:                                       //'tab'
        if (draw == 'circles') {
          $('#draw_lines').click();
        } else {
          $('#draw_circles').click();
        }
        break;
      case 13:                                      //'enter'
        if (state[0] == 'point_picked') {
          if (isNaN(parseFloat($('#stdin').val())))
            break;

          state[0] = 'none';
          switch (draw) {
            case 'circles':
              c = new circle(r.mempoint[0], r.mempoint[1], $('#stdin').val());
              r.circles.push(c);
              r.redraw();
              r.regen_snappoints();
              break;
            case 'lines':
              rad = $('#stdin').val() * Math.PI / 180;
              v = [Math.cos(rad), Math.sin(rad)];
              l = new line(r.mempoint[0], r.mempoint[1], r.mempoint[0] + v[0], r.mempoint[1] + v[1]);
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
          state[0] = 'none';
          r.redraw();
        }
        break;
      case 48: case 49: case 50: case 51: case 52:  //'0'-'4'
      case 53: case 54: case 55: case 56: case 57:  //'5'-'9'
        stdin_write(String(event.which - 48));
        break;
      case 67:                                      //'c'
        if (cursor_at == null)
          return;
        var smldst = SNAP_DISTANCE + 1;
        for (i=0; i<r.circles.length; i++) {
          var c_dist = Math.sqrt(sq(r.circles[i].x - cursor_at[0]) + sq(r.circles[i].y - cursor_at[1]));
          var dist = Math.abs(c_dist - r.circles[i].r);
          if ((dist <= SNAP_DISTANCE) && (dist < smldst)) {
            smldst = dist;
            snap_to = i;
          }
        }
        if (snap_to != null) {
          if (state[0] == 'delete_which') {
            state[0] = 'none';
            r.circles.splice(snap_to, 1);
            r.redraw();
          } else {
            canvas_click([r.circles[snap_to].x, r.circles[snap_to].y]);
          }
          snap_to = null;
        }
        break;
      case 68:                                      //'d'
        state[0] = 'delete_which';
        break;
      case 72:                                      //'h'
        if (state[0] == 'point_picked' && draw == 'lines') {
          state[0] = 'none';
          l = new line(r.mempoint[0], r.mempoint[1], r.mempoint[0] + 1, r.mempoint[1]); //make a horizontal line
          r.lines.push(l);
          r.redraw();
          r.regen_snappoints();
        }
        break;
      case 73:                                      //'i'
        if (state[0] == 'zoom_which' && cursor_at != null) {
          state[0] = 'none';
          var new_left = (cursor_at[0] + r.left) / 2;
          var new_top = (cursor_at[1] + r.top) / 2;
          r.left = new_left;
          r.top = new_top;
          r.scale *= 2;
          r.redraw();
        }
        break;
      case 76:                                      //'l'
        if (cursor_at == null)
          return;
        var smldst = SNAP_DISTANCE + 1;
        for (i=0; i<r.lines.length; i++) {
          var dist = r.lines[i].dist_to_point(cursor_at);
          if ((dist <= SNAP_DISTANCE) && (dist < smldst)) {
            smldst = dist;
            snap_to = i;
          }
        }
        if (snap_to != null) {
          if (state[0] == 'delete_which') {
            state[0] = 'none';
            r.lines.splice(snap_to, 1);
            r.redraw();
          } else {
            canvas_click(r.lines[snap_to].project_point(cursor_at));
          }
          snap_to = null;
        }
        break;
      case 79:                                      //'o'
        if (state[0] == 'zoom_which' && cursor_at != null) {
          state[0] = 'none';
          var new_left = r.left * 2 - cursor_at[0];
          var new_top = r.top * 2 - cursor_at[1];
          r.left = new_left;
          r.top = new_top;
          r.scale /= 2;
          r.redraw();
        }
        break;
      case 80:                                      //'p'
        switch (state[0]) {
          case 'none':
          case 'point_picked':
            if (cursor_at == null)
              return;
            var smldst = SNAP_DISTANCE + 1;
            for (i=0; i<r.snappoints.length; i++) {
              var dist = Math.abs(r.snappoints[i][0] - cursor_at[0]) + Math.abs(r.snappoints[i][1] - cursor_at[1]);
              if ((dist <= SNAP_DISTANCE) && (dist < smldst)) {
                smldst = dist;
                snap_to = i;
              }
            }
            if (snap_to != null) {
              canvas_click(r.snappoints[snap_to]);
              snap_to = null;
            }
            break;
          case 'symmetry_how':
            state[1] = 'symmetry_point';
            break;
        }
        break;
      case 83:                                      //'s'
        //var str = JSON.stringify(r); // TODO save function
        //alert(str);
        //jQuery.ajax({
        //  url: 'save.php',
        //  data: str,
        //  complete: function(jqHXR, testStatus) {
        //    alert(testStatus);
        //  },
        //});
        state[1] = 'symmetry_how';
        break;
      case 86:                                      //'v'
        if (state[0] == 'point_picked' && draw == 'lines') {
          state[0] = 'none';
          l = new line(r.mempoint[0], r.mempoint[1], r.mempoint[0], r.mempoint[1] + 1); //make a vertical line
          r.lines.push(l);
          r.redraw();
          r.regen_snappoints();
        }
        break;
      case 87:                                      //'w'
        shownext = true;
        break;
      case 90:                                      //'z'
        state[0] = 'zoom_which';
        break;
      case 173:                                     //'-'
        stdin_write('-');
        break;
      case 190:                                     //'.'
        stdin_write('.');
        break;
      case 192:                                     //'`'
        var state_output = '';
        for (i=0; i<state.length; i++) {
          state_output += state[i] + ' ';
        }
        alert(state_output);
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
  });

  $('#draw_lines').click(function() {
    draw = 'lines';
    $(this).addClass('selected').removeClass('non-selected');
    $('#draw_circles').addClass('non-selected').removeClass('selected');
  });

  $('#clear_all').click(function() {
    r.circles = Array();
    r.lines = Array();
    r.snappoints = Array();
    r.redraw();
    state[0] = 'none';
  });
});
