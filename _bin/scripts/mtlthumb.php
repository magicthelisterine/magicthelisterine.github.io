<?php
const CACHE = false;

define('ROOT', realpath(__DIR__ . '/../../').'/');
define('DATA_DIR', realpath(ROOT . 'assets/data') . '/');
define('THUMBNAILS_DIR', realpath(ROOT . 'assets/images/cartes/thumbnails') . '/');
define('ORIGINALS_DIR', realpath(ROOT . 'assets/images/cartes/originals') . '/');
require_once(realpath(ROOT . 'pxdoc/_bin/scripts/utils.php'));
require_once(__DIR__ . '/libraries/brainstorm.class.php');







// die();
if(!CACHE) {
    if(!$cards = Brainstorm::getCards()) err("Can't get cards from API.");
    file_put_contents(DATA_DIR . 'cards.json', json_encode($cards));
    Cache::set('cards', $cards);
} else $cards = Cache::get('cards');




foreach($cards as $card) {
    if(empty($card->image)) continue;
    if(!empty($card->image->webp_small) && !empty($card->image->webp_medium)) continue; // add more size later

    print_r($card);

    
    if(!is_file(($original = ORIGINALS_DIR . $card->image->uuid . '.jpg'))) {
        if(!$contents = curl_get_contents($card->image->url)) err("Can't download original image.");
        if(!blobToJpeg($contents, $original)) err("Can't save original image.");
    }
    if(!$blob = file_get_contents($original)) err("Can't read original image.");

    if(empty($card->image->webp_small)) {
        $name = $card->image->uuid . '_small.webp';
        $dest = THUMBNAILS_DIR . $name;
        if(!blobToWebp($blob, $dest, 120, 90)) err("Can't save small thumbnail image.");
        $updatefields['webp_small'] = $name;
    }
    
    if(empty($card->image->webp_medium)) {
        $name = $card->image->uuid . '_medium.webp';
        $dest = THUMBNAILS_DIR . $name;
        if(!blobToWebp($blob, $dest, 640, 480)) err("Can't save small thumbnail image.");
        $updatefields['webp_medium'] = $name;
    }


    if(!empty($updatefields)) Brainstorm::updateImage($card->image->uuid, $updatefields);
}


function blobToJpeg($blob, $dest) {
    try {
        // Créer une image à partir du blob
        $sourceImage = imagecreatefromstring($blob);
        if (!$sourceImage) {
            throw new Exception('Failed to create image from blob.');
        }

        // Sauvegarder l'image en format JPEG avec une qualité maximale
        if (!imagejpeg($sourceImage, $dest, 100)) {
            throw new Exception('Failed to save image as JPEG.');
        }

        // Libération de la mémoire
        imagedestroy($sourceImage);

        return $dest;
    } catch (Exception $e) {
        return false;
    }
}




function blobToWebp($blob, $dest, $width, $height) {
    try {
        // Créer une image à partir du blob
        $sourceImage = imagecreatefromstring($blob);
        if (!$sourceImage) {
            throw new Exception('Failed to create image from blob.');
        }

        $originalWidth = imagesx($sourceImage);
        $originalHeight = imagesy($sourceImage);
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

        // Créer une image de destination pour le recadrage
        $croppedImage = imagecreatetruecolor($newWidth, $newHeight);
        imagecopy($croppedImage, $sourceImage, 0, 0, $cropX, $cropY, $newWidth, $newHeight);

        // Redimensionner l'image
        $resizedImage = imagecreatetruecolor($width, $height);
        imagecopyresampled($resizedImage, $croppedImage, 0, 0, 0, 0, $width, $height, $newWidth, $newHeight);

        // Sauvegarder l'image en format WEBP
        if (!imagewebp($resizedImage, $dest)) {
            throw new Exception('Failed to save image as WEBP.');
        }

        // Libération de la mémoire
        imagedestroy($sourceImage);
        imagedestroy($croppedImage);
        imagedestroy($resizedImage);

        return $dest;
    } catch (Exception $e) {
        return false;
    }
}



