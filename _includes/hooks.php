<?php

/******************************************************
 *                 Composante Compdate                *
 ******************************************************/
register_tag('compdate', function($html, $attrs, $data) {
    return '<time datetime="' . date('Y-m-d H:i:s') . '">' . date('Y-m-d H:i:s') . '</time>';
});



/******************************************************
 *                   Composante GDoc                  *
 ******************************************************/
register_tag('gdoc', function($html, $attrs, $data) {
    if(empty($attrs['id'])) return errcomp('Google Document', 'Missing id parameter.');
    if(!$data = curl_get_contents("https://script.google.com/macros/s/" . $attrs['id'] . "/exec")) return errcomp('Google Document', 'Invalid document id');
    return $data;
});


