const SubmitForm = {


    init: function () {
        HintSymbols.init();
    },

}






const HintSymbols = {


    init: function () {
        const hintBox = document.body.create('div', 'card-submit-cost-symbols');
        const input = document.getElementById('myInput');

        // hintBox.innerHTML = '✨ Message d’aide qui flotte par-dessus tout, même hors conteneur.';

        const btn = hintBox.create('div', 'card-submit-cost-symbols-btn');
        btn.bind('click', (evt) => {
            // console.log(input.value);

            input.value += 'a';

        });




        let blockBlur = false;

        function positionHintBox() {
            hintBox.style.display = 'block';
            hintBox.style.visibility = 'hidden'; // pour mesurer la hauteur sans clignoter

            const rect = input.getBoundingClientRect();
            const hintHeight = hintBox.offsetHeight;

            hintBox.style.left = rect.left + window.scrollX + 'px';
            hintBox.style.top = (rect.top + window.scrollY - hintHeight - 8) + 'px';

            hintBox.style.visibility = 'visible';
        }

        input.addEventListener('focus', positionHintBox);

        input.addEventListener('blur', () => {
            if (!blockBlur) {
                hintBox.style.display = 'none';
            }
        });

        // Quand on clique dans le hint, on bloque temporairement le blur
        hintBox.addEventListener('mousedown', () => {
            blockBlur = true;
        });

        // Puis on relâche le blocage après le click
        hintBox.addEventListener('mouseup', () => {
            setTimeout(() => {
                blockBlur = false;
                input.focus(); // remet le focus si nécessaire
            }, 0);
        });


    },

}