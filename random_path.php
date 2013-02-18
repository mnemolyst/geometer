<?php
  $points = array();
  $lines = array();
  foreach ($_POST as $k => $v) {
    switch (substr($k, 0, 1)) {
      case 'w':
        $width = $v;
        break;
      case 'h':
        $height = $v;
        break;
      case 'p':
        $points[substr($k, 1, 2)] = explode(',', $v);
        break;
      case 'l':
        $lines[substr($k, 1, 2)] = explode(',', $v);
        break;
    }
  }

  //$file = fopen('save', 'w');
  //fwrite($file, $width);
  //fwrite($file, $height);
  //fwrite($file, var_export($points, TRUE));
  //fwrite($file, var_export($lines, TRUE));
  //fclose($file);

  function path_score($path) {
    global $points;

    $score = 0;
    foreach($path as $p) {
      $dist = sqrt($points[$p][0] * $points[$p][0] + $points[$p][1] * $points[$p][1]);
      $score += 1/(abs(150 - $dist));
    }
    return $score;
  }

  function point_on_line($p, $l) {
    if ($p === null) {
      return false;
    } else {
      return in_array($p, $l);
    }
  }

  function valid_next_points($path) {
    global $points;
    global $lines;
    $ret = array();

    switch (count($path)) {
      case 0:
        return array_keys($points);
        break;
      case 1:
        $last_point = $path[0];
        $n2last_point = null;
        break;
      default:
        $last_point = $path[count($path)-1];
        $n2last_point = $path[count($path)-2];
        break;
    }
        
    foreach ($lines as $line) {
      // include all points connected to last point, but not on the same line as next-to-last point
      if (point_on_line($last_point, $line) && ! point_on_line($n2last_point, $line)) {
        foreach ($line as $p) {
          if (! in_array($p, $ret) && $p != $last_point)
            $ret[] = $p;
        }
      }
    }

    return $ret;
  }

  function add_rand_point($path) {
    $candidates = valid_next_points($path);
    if (empty($candidates)) {
      $ret = '';
      foreach ($path as $p) {
        $ret .= "$p[0],";
      }
      print $ret . '***';
    }
    $i = array_rand($candidates);
    return array_merge($path, array($candidates[$i]));
  }

  function add_rand_points($path, $num = 1) {
    for ($i=0; $i<$num; $i++) {
      $path = add_rand_point($path);
    }
    return $path;
  }

  $path = array();

  $path = add_rand_points($path, 35);

  foreach ($path as $p) {
    $output .= $points[$p][0] . ',' . $points[$p][1] . ';';
    //$output .= "$p - ";
  }
  print substr($output, 0, strlen($output) - 1); //remove trailing ';'
?>
