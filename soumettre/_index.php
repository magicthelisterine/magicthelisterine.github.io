<?php 
/**
 * @index    8
 * @type     article
 * @title    Soumettre une carte
 * @icon     images/icon.webp
 * @image    ../assets/images/og-image.webp
 * @abstract Formulaire de soumission de carte
 */
?>

<div class="card-submit-container">
    <form>
        <table>
            <tr>
                <td rowspan="7">

                    <div class="dnd-file"></div>

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
                <td>
                    <input type="text" placeholder="Coût" autocomplete="off" id="myInput">
                </td>
            </tr>

        </table>
    </form>


</div>

<script src="./scripts/submit.min.js"></script>
<script>ready(evt => { SubmitForm.init(); });</script>







