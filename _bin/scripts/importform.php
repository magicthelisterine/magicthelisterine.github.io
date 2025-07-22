<?php

const CACHE = false;

define('ROOT', realpath(__DIR__ . '/../../').'/');
define('DATA_DIR', realpath(ROOT . 'assets/data') . '/');

require_once(realpath(ROOT . 'pxdoc/_bin/scripts/utils.php'));
require_once(__DIR__ . '/libraries/normalizer.class.php');
require_once(__DIR__ . '/libraries/brainstorm.class.php');



function str_normalize($str) {
	if(class_exists('Normalizer')) {
		$txt = Normalizer::normalize($str, Normalizer::FORM_D);
		$txt = preg_replace('/[\x{0300}-\x{036f}]+/u', '', $txt);
	} else {
		$txt = preg_replace('/\pM+/u', '', $str);
		$txt = preg_replace('/[\x{0300}-\x{036f}]+/u', '', $txt);
		$txt = preg_replace('~&([a-z]{1,2})(acute|cedil|circ|grave|lig|orn|ring|slash|th|tilde|uml|caron);~i', '$1', htmlentities($txt, ENT_QUOTES, 'UTF-8'));
	}
    return $txt;
}


// require_once(__DIR__ . '/libraries/brainstorm.class.php');

// https://script.google.com/macros/s/AKfycbxsuwr9Bcx8nnbbc85gDChfmFfBTnvxFItAJcMusfA-eqUnsgzh9JGj94mwumOYlTqe/exec

// AKfycbxsuwr9Bcx8nnbbc85gDChfmFfBTnvxFItAJcMusfA-eqUnsgzh9JGj94mwumOYlTqe


// $default = new stdClass;
// $default->author = '';
// $values = clone $detault;


// var_dump(class_exists('Normalizer'));

// die();
$default = (object)[
    'author'      => 'Magic the Listerine',
    'email'       => 'magicthelisterine@gmail.com',
    'name'        => '',
    'serie'       => '',
    'supertype'   => '',
    'type'        => '',
    'subtype'     => '',
    'power'       => 0,
    'toughness'   => 0,
    'cost'        => '',
    'description' => '',
    'flavor'      => '',
    'image'       => (object)[
        'filename' => '',
        'image'    => '',
    ],
];


$data = json_decode(file_get_contents(DATA_DIR . 'import.json'));

array_shift($data);
array_shift($data);

foreach($data as $elm) {
    if(empty($elm->Illustration)) continue;
    print_r($elm);
    
    $values = clone $default;
    $values->name = $elm->{'Titre de la carte'};
    $values->supertype = $elm->{'Supertype'};
    $values->type = str_normalize($elm->{'Type de carte'});
    $values->subtype = $elm->{'Sous-Type'};

    $values->power = $elm->{'Power/Toughness [Power]'};
    $values->toughness = $elm->{'Power/Toughness [Power]'};

    $values->description = $elm->{'Rule'};
    $values->flavor = $elm->{'Flavor'};

    if($elm->{'Cost [Any (#)]'}) $values->cost .= '{' . $elm->{'Cost [Any (#)]'} . '}';
    if($elm->{'Cost [Blanc (W)]'}) $values->cost .= str_repeat('{W}', $elm->{'Cost [Blanc (W)]'});
    if($elm->{'Cost [Bleu (U)]'}) $values->cost .= str_repeat('{U}', $elm->{'Cost [Bleu (U)]'});
    if($elm->{'Cost [Noir (B)]'}) $values->cost .= str_repeat('{B}', $elm->{'Cost [Noir (B)]'});
    if($elm->{'Cost [Rouge (R)]'}) $values->cost .= str_repeat('{R}', $elm->{'Cost [Rouge (R)]'});
    if($elm->{'Cost [Vert (G)]'}) $values->cost .= str_repeat('{G}', $elm->{'Cost [Vert (G)]'});


    parse_str(parse_url($elm->Illustration, PHP_URL_QUERY), $attrs);
    if(!$info = curl_get_info('https://drive.google.com/uc?export=view&id=' . $attrs['id'])) err("Can't get image info.");
    if(!preg_match('#^image/(.*)$#i', $info['content_type'], $m)) err('Wrong image type: '. $info['content_type']);

    $values->image->filename = $attrs['id'] . '.' . $m[1];
    $values->image->image = 'data:' . $info['content_type'] . ';charset=utf-8;base64,';

    if(!$contents = curl_get_contents('https://drive.google.com/uc?export=view&id=' . $attrs['id'])) err("Can't download image");
    $values->image->image .= base64_encode($contents);


    Brainstorm::addCard($values);

    // print_r($values);

    // print_r($info);

    
    // parse_str(parse_url($elm->Illustration, PHP_URL_QUERY), $attrs);
    // print_r(curl_get_info('https://drive.google.com/uc?export=view&id=' . $attrs['id']));
    // data:image/jpeg;charset=utf-8;base64,




    // break;
}