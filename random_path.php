<?php
  $points = array();
  foreach ($_POST as $point) {
    $points[] = $point;
  }

  $path = array();
  $len = min(count($points), rand(2, 10));
  shuffle($points);
  for ($i=0; $i<$len; $i++) {
    $path[] = $points[$i];
  }

  $output = implode(';', $path);
  $file = fopen('save', 'w');
  fwrite($file, $output);
  fclose($file);

  print $output;
?>
