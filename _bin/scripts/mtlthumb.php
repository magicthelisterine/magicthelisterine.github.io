<?php
const CACHE = false;

define('ROOT', realpath(__DIR__ . '/../../').'/');
define('THUMBNAILS_DIR', realpath(ROOT . 'carte/thumbnails') . '/');
define('ORIGINALS_DIR', realpath(ROOT . 'carte/originals') . '/');
require_once(realpath(ROOT . 'pxdoc/_bin/scripts/utils.php'));
require_once(__DIR__ . '/libraries/brainstorm.class.php');







// die();
if(!CACHE) {
    if(!$cards = Brainstorm::getCards()) err("Can't get cards from API.");
    Cache::set('cards', $cards);
} else $cards = Cache::get('cards');




foreach($cards as $card) {
    if(empty($card->image)) continue;
    if(!empty($card->image->webp_small)) continue; // add more size later

    print_r($card);

    
    if(!is_file(($original = ORIGINALS_DIR . $card->image->uuid . '.jpg'))) {
        if(!$contents = curl_get_contents($card->image->url)) err("Can't download original image.");
        if(!blobToJpeg($contents, $original)) err("Can't save original image.");
    }
    if(!$blob = file_get_contents($original)) err("Can't read original image.");

    if(empty($card->image->webp_small)) {
        $name = $card->image->uuid . '_small.webp';
        $dest = THUMBNAILS_DIR . $name;
        if(!blobToWebp($blob, $dest, 64, 64)) err("Can't save small thumbnail image.");
        
        
        Brainstorm::updateImage($card->image->uuid, [
            'webp_small' => $name,
        ]);
        

    }
    


    // break;
}





function blobToJpeg($blob, $dest) {
    try {
        $im = new Imagick;
        $im->readImageBlob($blob);
        $im->setImageCompression(Imagick::COMPRESSION_JPEG);
        $im->setImageCompressionQuality(100);
        $im->writeImage($dest);
        $im->destroy();
        return $dest;
    } catch(Exception $e) {
        return false;
    }
}


function blobToWebp($blob, $dest, $width, $height) {
    try {
        $im = new Imagick;
        $im->readImageBlob($blob);

        $originalWidth = $im->getImageWidth();
        $originalHeight = $im->getImageHeight();
        $aspectRatio = $originalWidth / $originalHeight;
        $targetAspectRatio = $width / $height;
        
        if ($aspectRatio > $targetAspectRatio) {
            $newHeight = $originalHeight;
            $newWidth = (int)($originalHeight * $targetAspectRatio);
        } else {
            $newWidth = $originalWidth;
            $newHeight = (int)($originalWidth / $targetAspectRatio);
        }
        
        $cropX = (int)(($originalWidth - $newWidth) / 2);
        $cropY = (int)(($originalHeight - $newHeight) / 2);
        
        $im->cropImage($newWidth, $newHeight, $cropX, $cropY);
        $im->resizeImage($width, $height, Imagick::FILTER_LANCZOS, 1);
        $im->setImageFormat('webp');
        $im->setOption('webp:method', '6'); 
        $im->writeImage($dest);
        $im->destroy();
        return $dest;
    } catch(Exception $e) {
        return false;
    }
}



