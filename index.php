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
      <div id="clear_all" class="control">clear</div>
      <input type="text" id="cmdline" size="25" />
    </div>
  </div>
</body>
</html>
