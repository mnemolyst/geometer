<?php
  $file = fopen('save', 'w');
  $output = print_r(array_keys($_GET), TRUE);
  fwrite($file, $output);
  fclose($file);
?>
