import React from "react";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import FormatDifference from './FormatDifference';

const generateReportA = (clientData, deptHrsMins, deptDecHrsMins, totalHrsMins, totalDecimalHours) => {

    const doc = new jsPDF();
    doc.setFontSize(8); // Set the font size to 12 points

    if (!Array.isArray(clientData)) {
    console.error("Invalid data format. Expected an array:", clientData);
    return doc;
    }
    // Example: Adding text to the PDF. You should replace this with your actual data formatting

    let client = '';
    let department = '';
    
    if (clientData.length === 0) {
        doc.text(`No entries found for the selected filters`, 10, 20);
        return doc;
    } else if (clientData.length > 0) {
        client = String(clientData[0][0].client);
    }


    const label1 = 'Kunde:';
    const label2 = 'Abteilung:';
    const maxLabelLength = Math.max(label1.length, label2.length) + 15;

    
    doc.setFontSize(12);
    doc.text("Zeiterfassung", 10, 20);
    doc.line(10, 25, 210 - 10, 25);
    doc.text(`${label1}${' '.repeat(maxLabelLength - label1.length)}${client}`, 10, 30);
    // doc.text(`Kunde: \t\t\t${client}`, 10, 30);
    // doc.text(`Abteilung: \t\t${client}`, 10, 40);
    doc.setFontSize(8);
    
    const columns = ["Datum", "Startzeit", "Endzeit", "Arbeitszeit", "Projekt", "Gegenpartei", "Beratung", "DLC Staff"]; // Add more columns as needed
    let startY = 40;
    const marginHorizontal = 10;
    const fontSize = 8;
    const lineOffset = 5;
    const textOffset = 12;
    
    // iterate through clientData Array of Arrays
    clientData.forEach((data, index) => {
        doc.setFontSize(12);
        doc.text(`${label2}${' '.repeat(maxLabelLength - label2.length)}${String(clientData[index][0].department)}`, 10, startY);
        startY += 10; // Increase the startY position for the
        doc.setFontSize(8);
        const tableData = data.map(item => [
            new Date(item.start_time).toLocaleDateString('de-GE', { day: '2-digit', month: '2-digit', year: 'numeric' }), // Format the date as DD.MM.YYYY
            new Date(item.start_time).toLocaleTimeString('de-GE', { hour: '2-digit', minute: '2-digit' }), // Get the time in HH:MM format
            new Date(item.end_time).toLocaleTimeString('de-GE', { hour: '2-digit', minute: '2-digit' }), // Get the time in HH:MM format     
            FormatDifference(item.time_diff_hrs_mins), 
            item.project, 
            item.counterparty, 
            item.description, 
            item.pid // Map other fields as needed
        ]);

        doc.autoTable({
            head: [columns],
            body: tableData,
            startY,
            margin: { horizontal: marginHorizontal },
            styles: { overflow: 'linebreak', fontSize},
            bodyStyles: { valign: 'top' },
            columnStyles: { id: { fontStyle: 'bold' } }, // Example: making 'id' column bold
            headStyles: { fillColor: [212,165,154] }
        });

        doc.line(10, doc.autoTable.previous.finalY + lineOffset, 210 - 10, doc.autoTable.previous.finalY + lineOffset); // 210 and 15 are the width of the page
        doc.text(`Arbeitszeit: \t${String(deptHrsMins[index])} h \t\t Dezimal: \t${String(deptDecHrsMins[index])} h`, 10, doc.autoTable.previous.finalY + textOffset); // Example: adding text below the table   

        startY = doc.autoTable.previous.finalY + 30;
    });

    if (doc.autoTable.previous && typeof doc.autoTable.previous.finalY === 'number') {
        let finalY = doc.autoTable.previous.finalY;
        doc.line(10, finalY + 20, 210 - 10, finalY +20);
        doc.text('Gesamt', 10, finalY + 30); // Example: adding text below the table
        doc.text(`Arbeitszeit: \t${String(totalHrsMins)} h \t\t Dezimal: \t${String(totalDecimalHours)} h`, 10, finalY + 35); // Example: adding text below the table   
        doc.line(10, finalY + 37, 210 - 10, finalY + 37); // 210 and 15 are the width of the page
        doc.line(10, finalY + 38, 210 - 10, finalY + 38); // 210 and 15 are the width of the page
    }

    return doc

};

const generateReportB = (clientDeptProjData, projHrsMins, projDecHrsMins, deptHrsMins, deptDecHrsMins, totalHrsMins, totalDecimalHours) => {


    const doc = new jsPDF();
    
    // if (!Array.isArray(clientDeptProjData)) {
    // console.error("Invalid data format. Expected an array:", clientDeptProjData);
    // return doc;
    // }
    // Example: Adding text to the PDF. You should replace this with your actual data formatting


    let client = '';
    let department = '';

    if (Object.keys(clientDeptProjData).length === 0) {
        doc.text(`No entries found for the selected filters`, 10, 20);
        return doc;
    } else {
        const firstDept = Object.keys(clientDeptProjData)[0];
        const firstProject = Object.keys(clientDeptProjData[firstDept])[0];
        client = String(clientDeptProjData[firstDept][firstProject][0][0].client);
    }

    const label1 = 'Client:';
    const label2 = 'Department:';
    const maxLabelLength = Math.max(label1.length, label2.length) + 1;

    

    doc.setFontSize(12);
    doc.text("Hourly Breakdown", 10, 20);
    doc.line(10, 25, 210 - 10, 25);
    doc.text(`${label1}${' '.repeat(maxLabelLength - label1.length)}${client}`, 10, 30);
    doc.setFontSize(8);

    
    const columns = ["Date", "Start", "End", "Time", "Project", "Counterparty", "Description", "DLC Staff"]; // Add more columns as needed
    let startY = 40;
    const marginHorizontal = 10;
    const fontSize = 8;
    const lineOffset = 5;
    const textOffset = 12;

    // iterate through clientData Array of Arrays
    let index = 0;
    for (let dept in clientDeptProjData) {
        
        doc.setFontSize(12);
        doc.text(`${label2}${' '.repeat(maxLabelLength - label2.length)}${dept}`, 10, startY);
        doc.setFontSize(8);
        startY += 10; // Increase the startY position for the
        let allTableData = [];
        
        for (let project in clientDeptProjData[dept]) {
            
            const tableData = clientDeptProjData[dept][project].flatMap(innerArray => 
                innerArray.map(item => [
                    new Date(item.start_time).toLocaleDateString('de-GE', { day: '2-digit', month: '2-digit', year: 'numeric' }), // Format the date as DD.MM.YYYY
                    new Date(item.start_time).toLocaleTimeString('de-GE', { hour: '2-digit', minute: '2-digit' }), // Get the time in HH:MM format
                    new Date(item.end_time).toLocaleTimeString('de-GE', { hour: '2-digit', minute: '2-digit' }), // Get the time in HH:MM format     
                    FormatDifference(item.time_diff_hrs_mins), 
                    item.project, 
                    item.counterparty, 
                    item.description, 
                    item.pid // Map other fields as needed
                ]));
                
                allTableData.push(...tableData)
                
            }
            
            doc.autoTable({
                head: [columns],
                body: allTableData,
                startY,
                margin: { horizontal: marginHorizontal },
                styles: { overflow: 'linebreak', fontSize},
                bodyStyles: { valign: 'top' },
                columnStyles: { id: { fontStyle: 'bold' } }, // Example: making 'id' column bold
                headStyles: { fillColor: [212,165,154] }
            });


        doc.line(10, doc.autoTable.previous.finalY + lineOffset, 210 - 10, doc.autoTable.previous.finalY + lineOffset); // 210 and 15 are the width of the page
        doc.text(`Department Hours: \t${String(deptHrsMins[index])} h \t\t Decimal: \t${String(deptDecHrsMins[index])} h`, 10, doc.autoTable.previous.finalY + textOffset); // Example: adding text below the table   

        startY = doc.autoTable.previous.finalY + 30;
        index++;
    };

    if (doc.autoTable.previous && typeof doc.autoTable.previous.finalY === 'number') {
        let finalY = doc.autoTable.previous.finalY;
        doc.line(10, finalY + 20, 210 - 10, finalY +20);
        doc.text('Total', 10, finalY + 30); // Example: adding text below the table
        doc.text(`Hours: \t${String(totalHrsMins)} h \t\t Decimal: \t${String(totalDecimalHours)} h`, 10, finalY + 35); // Example: adding text below the table   
        doc.line(10, finalY + 37, 210 - 10, finalY + 37); // 210 and 15 are the width of the page
        doc.line(10, finalY + 38, 210 - 10, finalY + 38); // 210 and 15 are the width of the page
    }

    return doc

};



const generateReportAnnexTable = (projectData) => {
    console.log('projectTimes', projectData)
    const doc = new jsPDF();
    
    // if (!Array.isArray(data)) {
    // console.error("Invalid data format. Expected an array:", data);
    // return doc;
    // }
    // Example: Adding text to the PDF. You should replace this with your actual data formatting
    let startY = 30
    doc.setFontSize(12);
    doc.text("Project Overview by Counterparty", 10, startY);
    startY += 10;
    doc.text(`Client: \t\t${projectData.client}`, 10, startY);
    startY += 10;
    // Date(item.start_time).toLocaleDateString('de-GE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    doc.text(`Relevant Period: \t\t${new Date(projectData.startDate).toLocaleDateString('en-US', {month: 'long', year: 'numeric'} )}`, 10, startY);
    startY += 10;
    doc.line(10, startY + 5, 210 - 10, startY + 5);
    doc.setFontSize(8);
    
    const columns = ["Project", "Counterparty", "Total Time"]; // Add more columns as needed
    const marginHorizontal = 10;
    const fontSize = 8;
    const lineOffset = 5;
    const textOffset = 12;

    // iterate through clientData Array of Arrays
    for (let project in projectData.projectTimes) {

        doc.setFontSize(10);
        // doc.text(`Project: \t${project}`, 10, startY); // Print the key as a heading
        startY += 10; // Increase the startY position for the

        const tableData = projectData.projectTimes[project].map(item => [
                    item.project, 
                    item.counterparty,
                    FormatDifference(item.total_time_diff), 
                ]);


            doc.autoTable({
                head: [columns],
                body: tableData,
                startY,
                margin: { horizontal: marginHorizontal },
                styles: { overflow: 'linebreak', fontSize},
                bodyStyles: { valign: 'top' },
                columnStyles: { id: { fontStyle: 'bold' } }, // Example: making 'id' column bold
                headStyles: { fillColor: [212,165,154] }
            });
            // Use tableData here


        doc.line(10, doc.autoTable.previous.finalY + lineOffset, 210 - 10, doc.autoTable.previous.finalY + lineOffset); // 210 and 15 are the width of the page
        // doc.text(`Arbeitszeit: \t${String(deptHrsMins[index])} h \t\t Dezimal: \t${String(deptDecHrsMins[index])} h`, 10, doc.autoTable.previous.finalY + textOffset); // Example: adding text below the table   

        startY = doc.autoTable.previous.finalY + 20;
    };

    // if (doc.autoTable.previous && typeof doc.autoTable.previous.finalY === 'number') {
    //     let finalY = doc.autoTable.previous.finalY;
    //     doc.line(10, finalY + 20, 210 - 10, finalY +20);
    //     doc.text('Gesamt', 10, finalY + 30); // Example: adding text below the table
    //     doc.text(`Arbeitszeit: \t${String(totalHrsMins)} h \t\t Dezimal: \t${String(totalDecimalHours)} h`, 10, finalY + 35); // Example: adding text below the table   
    //     doc.line(10, finalY + 37, 210 - 10, finalY + 37); // 210 and 15 are the width of the page
    //     doc.line(10, finalY + 38, 210 - 10, finalY + 38); // 210 and 15 are the width of the page
    // }

    return doc

};


export { generateReportA, generateReportB, generateReportAnnexTable };
