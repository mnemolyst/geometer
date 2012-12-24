<html>
<head>
  <script type="text/javascript" src="jquery.min.js"></script>
  <script type="text/javascript" src="geometer.js"></script>
  <style type="text/css">
    .control-group { display:inline-block; vertical-align:top; }
    .control { border:1px solid #000000; width:200px; }
    .non-selected { background-color:#ffffff; }
    .selected { background-color:#ff0000; }
    #content-wrapper { position:relative; }
    #canvas-wrapper { position:absolute; left:0px; top:0px; }
    .canvas { position:absolute; left:0px; top:0px; border:1px solid #000000; }
    #control-wrapper { position:absolute; left:605px; top:0px; }
  </style>
</head>
<body>
  <div id="content-wrapper">
    <div id="canvas-wrapper">
      <canvas id="baseCanvas" class="canvas" width="600" height="600">No canvas</canvas>
      <!--<canvas id="infoCanvas" class="canvas" width="800" height="600">No canvas</canvas>-->
    </div>
    <div id="control-wrapper">
      <div class="control-group">
        <p><b>Draw</b></p>
        <div id="draw_circles" class="control control-draw selected">Circles</div>
        <div id="draw_lines" class="control control-draw non-selected">Lines</div>
        <div id="draw_path" class="control control-draw non-selected">Paths</div>
        <div id="random_path" class="control control-draw">Random path</div><br />
        <div id="clear_all" class="control control-draw">Clear all</div>
      </div>
      <div class="control-group">
        <p><b>Symmetry Group</b></p>
        <div id="rhombic_sym" class="control control-sym selected">Rhombic</div>
        <div id="square_sym" class="control control-sym non-selected">Square</div>
        <div id="hexagonal_sym" class="control control-sym non-selected">Hexagonal</div>
        <div id="rectangular_sym" class="control control-sym non-selected">Rectangular</div>
        <div id="parallelogram_sym" class="control control-sym non-selected">Parallelogram</div>
      </div>
      <div class="control-group">
        <div>
          <p><b>I/O</b></p>
          <input type="text" id="stdin" size="25" readonly="readonly" /><br />
          <input type="text" id="mem1" size="25" readonly="readonly" class="mem" value="" /><br />
          <input type="text" id="mem2" size="25" readonly="readonly" class="mem" value="" /><br />
          <input type="text" id="mem3" size="25" readonly="readonly" class="mem" value="" /><br />
          <input type="text" id="mem4" size="25" readonly="readonly" class="mem" value="" />
        </div>
        <div><textarea id="stdout" rows="10" cols="25" readonly="readonly"></textarea></div>
      </div>
    </div>
  </div>
</body>
</html>
