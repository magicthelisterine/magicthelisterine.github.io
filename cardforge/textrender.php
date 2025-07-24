<?php

function renderMagicTextGD($text, $outputFilePath, $maxWidth, $fontSize, $fontPathRegular, $fontPathItalic, $symbolToImage) {
    // Crée une image vide avec un fond transparent
    $imageHeight = 200;
    $img = imagecreatetruecolor($maxWidth, $imageHeight);
    imagesavealpha($img, true);
    $transparentColor = imagecolorallocatealpha($img, 0, 0, 0, 127);
    imagefill($img, 0, 0, $transparentColor);

    // Couleur du texte (noir)
    $textColor = imagecolorallocate($img, 0, 0, 0);
    $lineHeight = $fontSize * 1.5;
    $wrapLineHeight = $fontSize * 2;

    // Initialisation relative des positions x et y
    $x = $fontSize;
    $y = $fontSize * 2.5; 

    $currentLineHeight = $lineHeight;

    // Traitement des parties du texte
    $inItalic = false;
    $parts = preg_split('/({[^}]+}| )/i', $text, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);

    foreach ($parts as $part) {
        $lowerPart = strtolower($part);

        if ($lowerPart === '{i}') {
            $inItalic = true;
            continue;
        } elseif ($lowerPart === '{/i}') {
            $inItalic = false;
            continue;
        }

        if ($part === ' ') {
            if ($x > $fontSize) {
                $x += $fontSize / 3;
            }
            continue;
        }

        if (array_key_exists($lowerPart, $symbolToImage)) {
            $symbolImgPath = $symbolToImage[$lowerPart];
            $symbolImg = imagecreatefrompng($symbolImgPath);
            $originalSymbolWidth = imagesx($symbolImg);
            $originalSymbolHeight = imagesy($symbolImg);

            // Calculer la nouvelle largeur et hauteur des symboles
            $newSymbolHeight = $fontSize;
            $scalingFactor = $newSymbolHeight / $originalSymbolHeight;
            $newSymbolWidth = $originalSymbolWidth * $scalingFactor;

            // Redimensionner l'image du symbole
            $resizedSymbolImg = imagecreatetruecolor($newSymbolWidth, $newSymbolHeight);
            imagealphablending($resizedSymbolImg, false);
            imagesavealpha($resizedSymbolImg, true);
            imagecopyresampled($resizedSymbolImg, $symbolImg, 0, 0, 0, 0, $newSymbolWidth, $newSymbolHeight, $originalSymbolWidth, $originalSymbolHeight);
            imagedestroy($symbolImg);

            if ($x + $newSymbolWidth > $maxWidth) {
                $x = $fontSize;
                $y += $wrapLineHeight;
                $currentLineHeight = $lineHeight;
            }

            imagecopy($img, $resizedSymbolImg, $x, $y - $newSymbolHeight + $fontSize, 0, 0, $newSymbolWidth, $newSymbolHeight);
            imagedestroy($resizedSymbolImg);
            $x += $newSymbolWidth + ($fontSize / 2);
            $currentLineHeight = max($currentLineHeight, $newSymbolHeight + $fontSize);
        } else {
            $currentFontPath = $inItalic ? $fontPathItalic : $fontPathRegular;
            $textBox = imagettfbbox($fontSize, 0, $currentFontPath, $part);
            $textWidth = $textBox[2] - $textBox[0];

            if ($x + $textWidth > $maxWidth) {
                $x = $fontSize;
                $y += $wrapLineHeight;
                $currentLineHeight = $lineHeight;
            }

            imagettftext($img, $fontSize, 0, $x, $y, $textColor, $currentFontPath, $part);
            $x += $textWidth;
        }
    }

    // Rogner l'image autour du contenu
    $croppedImg = imagecropauto($img, IMG_CROP_TRANSPARENT);
    if ($croppedImg !== FALSE) {
        imagedestroy($img);
        $img = $croppedImg;
    }

    imagepng($img, $outputFilePath);
    imagedestroy($img);
}

// Exemple d'utilisation
$magicText = "Lancez {W}{U}{B}, {I}spécialement{U}{B}{/I}, ou {C} au choix.";
$outputFilePath = 'output_magic_text.png';
$maxWidth = 300;
$fontSize = 12;
$fontPathRegular = 'path_to_your_regular_font.ttf';
$fontPathItalic = 'path_to_your_italic_font.ttf';
$symbolToImage = [
    '{w}' => 'path_to_white_mana_image.png',
    '{u}' => 'path_to_blue_mana_image.png',
    // Ajoutez les autres symboles ici...
];

// Appel de la fonction
renderMagicTextGD($magicText, $outputFilePath, $maxWidth, $fontSize, $fontPathRegular, $fontPathItalic, $symbolToImage);

?>
