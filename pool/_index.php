<?php
/**
 * @type     virgin
 * @title    Pool de suggestions
 * @icon     images/icon.webp
 * @image    images/image.webp
 * @abstract Liste des cartes soumises
 */

$datadir = $PAGE->root . 'assets/data/';
$data = [
    'sortby' => json_decode(file_get_contents($datadir . 'sortby.json')),
    'types' => json_decode(file_get_contents($datadir . 'types.json')),
];
?>


<div class="loading-tri-circular main-inline"></div>
<script src="./scripts/cardpool.min.js"></script>
<script>ready(evt => { CardPool.init(<?php echo json_encode($data, JSON_NUMERIC_CHECK); ?>); });</script>
