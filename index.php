<html>
<head>
  <script type="text/javascript" src="jquery.min.js"></script>
  <script type="text/javascript" src="geometer.js"></script>
  <style type="text/css">
    .control { border:1px solid #000000; }
    .non-selected { background-color:#ffffff; }
    .selected { background-color:#ff0000; }
    #content-wrapper { position:relative; }
    #canvas-wrapper { position:absolute; left:0px; top:0px; }
    .canvas { position:absolute; left:0px; top:0px; border:1px solid #000000; }
    #control-wrapper { position:absolute; left:805px; top:0px; }
  </style>
</head>
<body>
  <div id="content-wrapper">
    <div id="canvas-wrapper">
      <canvas id="baseCanvas" class="canvas" width="800" height="600">No canvas</canvas>
      <!--<canvas id="infoCanvas" class="canvas" width="800" height="600">No canvas</canvas>-->
    </div>
    <div id="control-wrapper">
      <div id="draw_circles" class="control selected">circles</div>
      <div id="draw_lines" class="control non-selected">lines</div>
      <div id="draw_path" class="control non-selected">path</div>
      <div id="clear_all" class="control">clear</div>
      <div>
        <label for="stdin">stdin:</label>
        <input type="text" id="stdin" size="25" readonly="readonly" /><br />
        <input type="text" id="mem1" size="25" readonly="readonly" class="mem" value="" /><br />
        <input type="text" id="mem2" size="25" readonly="readonly" class="mem" value="" /><br />
        <input type="text" id="mem3" size="25" readonly="readonly" class="mem" value="" /><br />
        <input type="text" id="mem4" size="25" readonly="readonly" class="mem" value="" />
      </div>
      <div><label for="stdout">stdout:</label><input type="text" id="stdout" size="25" readonly="readonly" /></div>
    </div>
  </div>
</body>
</html>
