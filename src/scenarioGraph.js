export default class Scenario {

    options = {
        'storeChanges': false,
        'strokeColor': 'bcbdbd',
        'strokeWidth': '3',
        'cardShadowColor': '0,0,0,0.15',
        'selectedCardBorderColor': '228B22',
        'selectedCardBorderWidth': '2'
    };

    graphSelected = [];
    graphTraces = [];
    currentCols = 0;

    /**
     *
     * @param mainContainer : HTMLElement
     * @param graphCards : Array
     */
    constructor(mainContainer, graphCards, options = null) {
        this.handleOptions(options);
        if (!graphCards) {
            console.error('Data not found', `\nThe object containing the scenario elements is not found\nPlease refer to the documentation for further informations !`);
        }
        if (!mainContainer) {
            console.error('HTML container not found', `\nThe main container is not found !\nPlease refer to the documentation for further informations !`);
            return;
        }
        window.addEventListener('resize', () => {
            this.handleWindowResize(this.graphSelected)
        });
        this.graphCards = graphCards ? graphCards : [];
        this.mainContainer = mainContainer;
        this.reformatGraphCards(this.graphCards);
        this.initGraph();
    }

    /**
     * Replace the defined options
     * @param options : Object
     */
    handleOptions(options) {
        if (options) {
            for (let [option, value] of Object.entries(options)) {
                if (option in this.options) {
                    this.options[option] = value;
                }
            }
        }
    }

    /**
     * Update the svg lines
     */
    retraceGraph() {
        this.traceContainer.innerHTML = this.graphTraces;
    }

    /**
     * Retrace the scenario svg when window is resized
     * @param traces : Array
     */
    handleWindowResize(traces) {
        traces.forEach((card) => {
            this.linkWithPrev(card);
        })
    }

    /**
     * Create svg line between given card and his previous sibling
     * @param card : Object
     */
    linkWithPrev(card) {
        const id = card._id.toString();
        const cardCol = card._col;
        const cardColNum = parseInt(cardCol, 10);
        if (this.graphSelected[cardColNum - 2]) {
            this.graphSelected[cardColNum - 1] = card;
            const currentCard = document.querySelector(`.scenario-card[card-id = '${id}']`);
            const prevId = this.graphSelected[cardColNum - 2]._id;
            const prevCard = document.querySelector(`.scenario-card[card-id = '${prevId}']`);
            this.graphTraces[cardColNum - 2] = this.getTrace(this.calculateCoor(prevCard, currentCard));
            this.retraceGraph();
        }
    }

    /**
     * Get the _children cards of a given card
     * @param card : Object
     * @returns Array
     */
    getAllowedCards(card) {
        if (card && card._children) {
            return card._children;
        }
    }

    /**
     * Create HTML element of a scenario col using array of cards
     * @param cards : Array
     * @returns {HTMLDivElement}
     */
    getGraphCol(cards) {
        let elements = [];
        cards.forEach((card) => {
            let protoTitle = `<h6 class="text-center text-black-color">{{title}}</h6>`
            let protoBody = `<p class="card-description"> {{description}}</p>`;
            let cardButton = document.createElement('div');
            cardButton.classList = ['card-btn'];
            cardButton.addEventListener('click', () => {
                this.handleCardClick(card, cardButton);
            });

            let cardTitle = document.createElement('div');
            cardTitle.classList = ["card-title d-flex flex-column justify-content-center align-items-center"];
            cardTitle.innerHTML = protoTitle.replace('{{title}}', card.title) + protoBody.replace('{{description}}', card.description);

            let scenarioCard = document.createElement('div');
            scenarioCard.classList = ["scenario-card shadow-card"];
            scenarioCard.setAttribute('card-id', card._id);
            scenarioCard.setAttribute('selected', card._selected);

            scenarioCard.appendChild(cardButton);
            scenarioCard.appendChild(cardTitle);

            elements.push(scenarioCard);
        });
        let col = document.createElement('div');
        col.classList = ['cards-col col-3 d-flex flex-column justify-content-around align-items-center'];
        col.setAttribute('col-pos', this.currentCols);

        elements.forEach((el) => {
            col.appendChild(el)
        });
        return col;
    }

    /**
     * Handle the card click
     * @param card : Object
     * @param cardButton : HTMLElement
     */
    handleCardClick(card, cardButton) {
        const cardCol = card._col;
        this.removeColsAfter(cardCol);
        this.linkWithPrev(card);
        this.addGrahpCol(this.getAllowedCards(card));
        let siblings = this.getSiblings(cardButton.parentElement);
        siblings.forEach((el) => {
            el.classList.remove('selected-card');
            el._selected = false;
        });
        cardButton.parentElement.classList.add('selected-card');
        card._selected = true;
        if (this.options.storeChanges) {
            localStorage.graphSelected = JSON.stringify(this.graphSelected);
        }
        // Resize the traceContainer width accordingly to the mainContainer width
        this.traceContainer.style.width = this.mainContainer.scrollWidth
    }

    /**
     * Adds the generated col element in the DOM
     * @param graphCards : Array
     */
    addGrahpCol(graphCards) {
        if (graphCards) {
            this.currentCols++;
            this.mainContainer.appendChild(this.getGraphCol(graphCards));
        }
    }

    /**
     * Get the next siblings of an HTML element (Like jQuery nextSiblings method)
     * @param el : HTMLElement
     * @returns Array
     */
    getNextSiblings(el) {
        if (el) {
            var siblings = [];
            while (el = el.nextSibling) {
                siblings.push(el);
            }
            return siblings;
        }
    }

    /**
     * Get all siblings for a given element
     * @param el : HTMLElement
     * @returns Array
     */
    getSiblings = function (el) {
        var siblings = [];
        var sibling = el.parentNode.firstChild;
        while (sibling) {
            if (sibling.nodeType === 1 && sibling !== el) {
                siblings.push(sibling);
            }
            sibling = sibling.nextSibling
        }
        return siblings;
    };

    /**
     * Remove all scenario cols after a given col
     * @param col : String
     */
    removeColsAfter(col) {
        const colNum = parseInt(col, 10);
        const currentCol = document.querySelector(`.cards-col[col-pos='${col}']`);
        const nextcols = this.getNextSiblings(currentCol);
        this.currentCols = colNum;
        if (nextcols) {
            nextcols.forEach((el) => el.remove());
            this.graphTraces.splice(colNum - 1, this.graphTraces.length);
            this.graphSelected.splice(colNum, this.graphSelected.length);
            this.retraceGraph();
        }
    }

    /**
     *  Attribute css classes to main container and to svg lines container
     */
    initContainers() {
        this.traceContainer = this.mainContainer.querySelector('svg');
        this.traceContainer.classList = ['scenario-trace'];
        this.mainContainer.appendChild(this.traceContainer);
        this.mainContainer.classList = ["d-flex flex-row justify-content-start align-items-center main_scenario_container"];
    }

    /**
     * Initialize the scenario graph and adds the first elements
     */
    initGraph() {
        this.graphSelected.push(this.graphCards[0]);
        this.initContainers();
        this.addGrahpCol(this.graphCards);
        if (localStorage.graphSelected) {
            this.graphSelected = JSON.parse(localStorage.graphSelected);
            this.graphSelected.forEach((card) => {
                // const cardCol = card._col;
                // this.removeColsAfter(cardCol);
                this.linkWithPrev(card);
                this.addGrahpCol(this.getAllowedCards(card));
                let selectedIds = this.graphSelected.map(el => el._id);
                let selectedCards = document.querySelectorAll('.scenario-card');
                selectedCards.forEach((el) => {
                    if (selectedIds.includes(el.getAttribute('card-id'))) {
                        el.classList.add('selected-card');
                    }
                })
            })
        }
        if (!this.options.storeChanges) {
            localStorage.removeItem('graphSelected');
        }
        this.initStyles();
    }

    /**
     * Init initial styles and passed into options
     */
    initStyles() {

        let strokeColor = this.options.strokeColor;
        let strokeWidth = this.options.strokeWidth;
        let cardShadowColor = this.options.cardShadowColor;
        let selectedCardBorderColor = this.options.selectedCardBorderColor;
        let selectedCardBorderWidth = this.options.selectedCardBorderWidth;

        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            .main_scenario_container line {
                stroke: #${strokeColor};
                stroke-width: ${strokeWidth}px;
             }
             .shadow-card {
                box-shadow:0 .5rem 1rem rgba(${cardShadowColor})
            }
            .selected-card {
                border: solid ${selectedCardBorderWidth}px #${selectedCardBorderColor};
            }
        `;
        document.getElementsByTagName('head')[0].appendChild(style);

    }

    /**
     * Get the position, in the DOM, of a given element
     * @param el : HTMLElement
     * @returns {{x: Number, y: Number}}
     */
    getPos(el) {
        let lx = 0, ly = 0;
        while (el != null) {
            lx += el.offsetLeft;
            ly += el.offsetTop;
            el = el.offsetParent
        }
        return {x: lx, y: ly};
    }

    /**
     * Get the positions and the distance, in the drawing zone, between two given elements
     * @param firstElem : HTMLElement
     * @param secondElem : HTMLElement
     * @returns {{elem2: Object, elem1: Object, distCards: Number}}
     */
    calculateCoor(firstElem, secondElem) {
        const containerCoor = this.getPos(this.mainContainer);

        const firstElemCoor = this.getPos(firstElem);
        const secondElemCoor = this.getPos(secondElem);

        firstElemCoor.x -= containerCoor.x - firstElem.clientWidth / 2;
        secondElemCoor.x -= containerCoor.x - secondElem.clientWidth / 2;
        firstElemCoor.y -= containerCoor.y - firstElem.clientWidth / 2;
        secondElemCoor.y -= containerCoor.y - secondElem.clientWidth / 2;

        const distCards = (secondElemCoor.x - firstElemCoor.x) / 2;

        return {elem1: firstElemCoor, elem2: secondElemCoor, distCards: distCards};
    }

    /**
     * Get a formatted trace
     * @param trace : Object
     * @returns {string}
     */
    getTrace(trace) {
        return `<line x1="${trace.elem1.x}"
                        x2="${trace.elem1.x + trace.distCards}"
                        y1="${trace.elem1.y}"
                        y2="${trace.elem1.y}"></line>
                
                <line x1="${trace.elem1.x + trace.distCards}"
                        x2="${trace.elem2.x - trace.distCards}"
                        y1="${trace.elem1.y}"
                        y2="${trace.elem2.y}"></line>
                
                <line x1="${trace.elem2.x - trace.distCards} "
                        x2="${trace.elem2.x}"
                        y1="${trace.elem2.y}"
                        y2="${trace.elem2.y}"></line>`;
    }

    /**
     * Adds custom attributes to the original data object
     * @param cards : Array
     * @param currentCol : Number
     */
    reformatGraphCards(cards, currentCol = null) {
        cards.forEach((card, index) => {
            card.description = card.description ? card.description : '';
            card._selected = false;
            card._col = currentCol ? currentCol + 1 : 1;
            card._row = index + 1;
            card._id = card._col.toString() + card._row.toString();
            if (card._children) {
                this.reformatGraphCards(card._children, card._col)
            }
        });
    }

    /**
     * Generate the selected scenario as an array containing the selected cards
     * @returns Array
     */
    generateScenario() {
        return this.graphSelected;
    }

    /**
     * Generate an array containing the values of the selected field(s) in the generated scenario
     * @param fields : String[]
     */
    generateScenarioFields(fields) {
        let res = [];
        if (fields.length === 1) {
            this.graphSelected.forEach((el) => {
                if (fields[0] in el) {
                    res.push(el[fields[0]])
                }
            });
        } else {
            this.graphSelected.forEach((el) => {
                let elem = {};
                fields.forEach((field) => {
                    if (field in el) {
                        elem[field] = el[field];
                    }
                });
                res.push(elem);
            })
        }
        return res;
    }

}
