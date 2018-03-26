const ipc = require('electron').ipcRenderer;
 
const printPDFButton = document.getElementById('print-pdf');

printPDFButton.addEventListener('click',function( event){
    ipc.send('print-to-pdf');
});

ipc.on('wrote-pdf',function(event,path){
    const message = `Wrote PDF to : ${path}`;
    
})