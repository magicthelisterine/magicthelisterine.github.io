<?php 
/**
 * @index    8
 * @type     article
 * @title    Soumettre une carte
 * @icon     images/icon.webp
 * @image    ../assets/images/og-image.webp
 * @abstract Formulaire de soumission de carte
 */

$datadir = $PAGE->root . 'data/';
$series = json_decode(file_get_contents($datadir . 'series.json'));
$supertypes = json_decode(file_get_contents($datadir . 'supertypes.json'));
$types = json_decode(file_get_contents($datadir . 'types.json'));

$data = [
    "series" => $series,
    "supertypes" => $supertypes,
    "types" => $types,
];


// __print_r($data);

?>

<div class="card-submit-container">
    <form>
        <table>
            <tr>
                <td rowspan="7">

                    <div class="dnd-file" id="dnd" title="Déposez une image ici ou cliquez pour choisir un fichier">Déposez une image ici<br>ou<br>Cliquez pour choisir un fichier</div>

                </td>
                <td>
                    <input type="text" placeholder="Nom de la carte">
                </td>
            </tr>
            <tr>
                <td>
                    <select name="serie" id="serie">
                        <option value="">--- Série ---</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    <select name="supertype" id="supertype">
                        <option value="">--- Super type ---</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    <select name="type" id="type">
                        <option value="">--- Type ---</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    <input type="text" placeholder="Sous-type" id="subtype">
                </td>
            </tr>
            <tr>
                <td class="pt-input">
                    <input type="number" placeholder="Force" min="0" max="12" id="power">&nbsp;<strong>/</strong>&nbsp;<input type="number" placeholder="Endurance" min="0" max="12" id="toughness">
                </td>
            </tr>
            <tr>
                <td class="cost-input">
                    <input type="text" placeholder="Coût" autocomplete="off" pattern="[0-9rgubwxyzRGUBWXYZ\{\}]+"  title="Seuls les lettres RGUBWXYZ, les chiffres et les accolades {} sont permis." id="costInput"><div id="costRender" class="cost-render"></div>
                </td>
            </tr>

        </table>
    </form>


</div>

<script src="./scripts/submit.min.js"></script>
<script>ready(evt => { SubmitForm.init(<?php echo json_encode($data, JSON_NUMERIC_CHECK); ?>); });</script>







