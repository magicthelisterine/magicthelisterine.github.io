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
                <td rowspan="4">


                    <div class="dnd-file"></div>


                </td>
                <td>
                    <select name="supertype" id="supertype">
                        <option value="">--- Super type ---</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                <select name="type" id="type">
                        <option value="">--- type ---</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    <input type="text">
                </td>
            </tr>
            <tr>
                <td>
                    <input type="text">
                </td>
            </tr>
        </table>
    </form>


</div>