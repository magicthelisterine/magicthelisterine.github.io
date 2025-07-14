const SubmitForm = {


    init: function () {
        HintSymbols.init();
    },

}






const HintSymbols = {


    init: function () {
        const hintBox = document.body.create('div', 'card-submit-cost-symbols');
        const input = document.getElementById('myInput');

        const symbols = ["U", "G", "B", "W", "R", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "2B", "2G", "2R", "2U", "2W", "BG", "BR", "GU", "GW", "RG", "RW", "UB", "UR", "WB", "WU", "X", "Y", "Z"];

        symbols.forEach(v =>  {
            const btn = hintBox.create('div', 'symbol24 icon-' + v);
            btn.bind('click', evt => {
                input.value += '{' + v + '}';
            });
        });


        input.bind('input', evt => {
            console.log(input.value);
        });


        let blockBlur = false;

        function positionHintBox() {
            hintBox.style.display = 'block';
            hintBox.style.visibility = 'hidden';

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