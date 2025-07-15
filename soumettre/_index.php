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


<p>Vous avez toutes vos informations en main ? Le nom, la force, l’image… tout est prêt ? Alors remplissez ce formulaire mystique et donnez naissance à votre propre carte légendaire.</p>

<p>Pour vous aider, nous avons mis à votre disposition un peu de documentation dans le Journal de bord.</p>

<!-- <intlink href="../journal/"></intlink> -->
<boxlink href="../journal/"></boxlink>
<br>
<hr>

<div class="card-submit-container">
    <form>
        <table>
            <tr>
                <td rowspan="7">
                    <div class="dnd-file" id="dnd" title="Déposez une image ici ou cliquez pour choisir un fichier">Déposez une image ici<br>ou<br>Cliquez pour choisir un fichier</div>
                </td>
                <td>
                    <input type="text" placeholder="Nom de la carte" name="name" id="name" required>
                </td>
            </tr>
            <tr>
                <td>
                    <select name="serie" id="serie" required>
                        <option value="">--- Série ---</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    <select name="supertype" id="supertype" required>
                        <option value="">--- Super type ---</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    <select name="type" id="type" required>
                        <option value="">--- Type ---</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    <input type="text" placeholder="Sous-type" id="subtype" required>
                </td>
            </tr>
            <tr>
                <td class="pt-input">
                    <input type="number" placeholder="Force" min="0" max="12" id="power" required>&nbsp;<strong>/</strong>&nbsp;<input type="number" placeholder="Endurance" min="0" max="12" id="toughness" required>
                </td>
            </tr>
            <tr>
                <td class="cost-input">
                    <input type="text" placeholder="Coût" autocomplete="off" pattern="[0-9rgubwxyzRGUBWXYZ\{\}]+"  title="Seuls les lettres RGUBWXYZ, les chiffres et les accolades {} sont permis." id="costInput" required><div id="costRender" class="cost-render"></div>
                </td>
            </tr>
            <tr>
                <td colspan="2" class="MTGEditor-container">
                    <textarea id="desc" name="desc" id="" rows="10" placeholder="Description de la carte" required></textarea>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <textarea id="flavor" name="flavor" id="" rows="5" placeholder="Saveur de la carte"></textarea>
                </td>
            </tr>

        </table>
        
        <br><hr><br>

        <h2>Révision</h2>

        <checklist memory="false" callback="SubmitForm.progress">
            J’ai sélectionné une image en format <em>4/3</em> pour ma carte.
            Le nom de la carte est entré et ne contient <em>pas</em> de fautes.
            J’ai choisi la série, le supertype, le type et le sous-type appropriés.
            Le coût de mana est complet et <em>cohérent</em> avec la carte.
            Les valeurs de Force et d’Endurance sont présentes (si nécessaire).
            Le texte de règle est clair, bien écrit et <em>respecte</em> les conventions.
            J’ai ajouté un texte de saveur (facultatif, mais recommandé).
            Je confirme que l’image utilisée est <em>libre de droit</em> ou que j’en détiens les droits.
            Je consens à ce que les réviseurs puissent modifier l’image, le texte ou le design de la carte pour assurer la <em>cohérence</em> avec le reste du projet.
            Je suis prêt(e) à générer ma carte et à l’envoyer pour révision.
        </checklist>

        <hr>

        <div class="submit-btn">
            <input type="submit" value="Soumettre" id="submit-btn" disabled>
        </div>


    </form>
</div>






<script src="./scripts/submit.min.js"></script>
<script>ready(evt => { SubmitForm.init(<?php echo json_encode($data, JSON_NUMERIC_CHECK); ?>); });</script>







