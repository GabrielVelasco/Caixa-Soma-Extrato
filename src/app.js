// todo: 
// manage create github repo (docs and so...)
// manual to deploy..

const form = document.querySelector("#formTest");
const sumCont = document.querySelector("#sumResult");

const pixTransactionDescription = "ENVIO PIX" 
const cartaoTransactionDescription = "CP DB"

const todosSelectName = form[0][0].innerHTML.toLowerCase().replace(/\s/g, '');
const pixSelectName = form[0][1].innerHTML.toLowerCase().replace(/\s/g, '');
const cartaoSelectName = form[0][2].innerHTML.toLowerCase().replace(/\s/g, '');

function endOfLine(c){

    return c === '\n';
}

function endOfFile(i, txtLength){

    return i === txtLength - 1;
}

function pixOptionSelected(selectorValue){

    return selectorValue === pixSelectName;
}

function cartaoOptionSelected(selectorValue){

    return selectorValue === cartaoSelectName;
}

function todosOptionSelected(selectorValue){

    return selectorValue === todosSelectName;
}

function containsPixTransaction(actualLine){
    // Does this lines refers to a PIX type transaction?

    return actualLine.search(pixTransactionDescription) != -1    
}

function containsCartaoTransaction(actualLine){
    // Does this lines refers to a CARTAO type transaction?

    return actualLine.search(cartaoTransactionDescription) != -1    
}

function createArrOfLinesFromTxt(fileTxtContent, selectorValue){
    // each line from 'fileTxtContent' will be an element of the arrLines (returned)

    let actualLine = "";
    let firstLineHeader = true;
    const arrLines = [];
    for(let i = 0; i < fileTxtContent.length; i++){
        if(endOfLine(fileTxtContent[i]) || endOfFile(i, fileTxtContent.length)){
            // end of line, add line to array
    
            if(firstLineHeader){ 
                // ignores the header   
                firstLineHeader = false;
                actualLine = "";

                continue;
            }
        
            // line is to be considered?
            if(todosOptionSelected(selectorValue)){
                arrLines.push(actualLine); 
            
            }else if(pixOptionSelected(selectorValue) && containsPixTransaction(actualLine)){
                arrLines.push(actualLine);

            }else if(cartaoOptionSelected(selectorValue) && containsCartaoTransaction(actualLine)){
                arrLines.push(actualLine);
            }
            
            actualLine = ""; // reset
        
        }else {
            actualLine += fileTxtContent[i];

        }
    }

    return arrLines;
}

function isDebit(tmpStr){
    // if there's a 'D' inside the string, than it's a debit

    if (tmpStr.search('D') != -1)
        return true; // found 'D'
    else 
        return false; // didn't found 'D'
}

function getValidPrices(arrLines){
    // extract prices from each line and build array of prices (sum it up later...)

    const arrPrices = [];
    let splitedLineTokens = [];   // let?? or const? (ram manegement)
    let priceToken = "", lastToken = "";
    let floatPrice = 0.00;

    for(let line of arrLines){
        splitedLineTokens = line.split(';');
        lastToken = splitedLineTokens[ splitedLineTokens.length - 1 ];

        if(isDebit(lastToken)){
            priceToken = splitedLineTokens[ splitedLineTokens.length - 2 ]
            floatPrice = parseFloat(priceToken.replace(/"/g, ''));
            
            arrPrices.push(floatPrice);
        }
    }

    return arrPrices;
}

function sumArr(arrPrices){
    return arrPrices.reduce((partialSum, a) => partialSum + a, 0);
}

function sleepSimulation(ms){
    return new Promise((resolve, reject) => {
        // wait 'ms' till the promise get resolved
        setTimeout(() => {
            resolve();  // just resolve the promise
        }, ms);
    });
}

async function getTxtFileContent() {
    // returns content inside the uploaded txt file
  
    const file = form[1].files[0]; // input to upload file inside of a form
    const reader = new FileReader();
  
    if(file){
        reader.readAsText(file);
        await sleepSimulation(2000);  // wait for the promise to be resolved... (read all file)
        return reader.result; // resolve promise

    }else {
        throw "Error at reading the file. No file Selected!"; // reject promise

    }
}

function getActualSelectorValue(){
    // get transaction type "TODOS", "ENVIO PIX" ...

    return form[0].value.toLowerCase();
}

form.addEventListener("submit", async (evt) => {
    // Using a form to simulate an API call (post request...)

    evt.preventDefault();

    // get suff from form
    try{
        const fileTxtContent = await getTxtFileContent();
        let selectorValue = getActualSelectorValue();
        const arrLines = createArrOfLinesFromTxt(fileTxtContent, selectorValue); // lv of abstraction
        const arrPrices = getValidPrices(arrLines); // lv of abstraction
        const finalSum = sumArr(arrPrices);
    
        // updates sum value at html
        sumCont.innerHTML = "SOMA: <b>R$ " + finalSum.toFixed(2) + "</b>";

    }catch (e){
        console.log(e);
        sumCont.innerHTML = "Carregue o arquivo!";

    }
})
