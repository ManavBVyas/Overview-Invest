const PDFDocument = require('pdfkit');
const fs = require('fs');
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('test_output.pdf'));
doc.text('Hello World');
doc.end();
console.log("PDF: SUCCESS");
