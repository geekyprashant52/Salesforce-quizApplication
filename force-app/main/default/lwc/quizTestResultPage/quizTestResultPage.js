import { api, LightningElement, track, wire } from 'lwc';
import getQuizUserTestData from '@salesforce/apex/QuizUsersTestController.getQuizUserTestData';


import {CurrentPageReference, NavigationMixin } from 'lightning/navigation';

const columns = [
    { label: 'Question', fieldName: 'QuizQuestion__r__Question__c' , type: 'Text' },
    { label: 'Score', fieldName: 'Result__c' , type: 'Text'},
];
export default class QuizTestResultPage extends NavigationMixin(LightningElement) {
    datatableData;
    datatableError;
    datatableColumns = columns;
    @track testName;
    @track testDate;
    @track testTime;
    @track timeTaken;
    @track ownerName;
    @track totalTime;
    @track isDataLoading = true;

    @track score;
    finalScore = 0;

    currentPageReference;



    @wire(CurrentPageReference)
    setCurrentPageReference(reference)
    {
        this.currentPageReference = reference;
    }

    connectedCallback()
    {
        console.log(JSON.parse(JSON.stringify(this.currentPageReference.state)))
        let state = JSON.parse(JSON.stringify(this.currentPageReference.state));
        this.testName = state.testName;
        this.testDate = state.testDate;
        this.testTime = state.testTime;
        this.fetchDataFromDB();
    }

    fetchDataFromDB()
    {
        getQuizUserTestData({testName: this.testName, testDate: this.testDate, testTime: this.testTime})
        .then((data)=>{
            // response;
            this.datatableError = undefined;
            this.datatableData = data.map((record)=>{
                this.isDataLoading = false;
                this.ownerName = record.Owner.Name;
                this.totalTime = record.QuizQuestion__r.QuizTestName__r.Time_in_minutes__c;
                this.timeTaken = parseInt(record.Time_Taken__c);
                this.calculateScore(record.Result__c);
                return {...record, 
                    QuizQuestion__r__Question__c: record.QuizQuestion__r.Question__c
                }
            })
            this.score = (this.finalScore / (this.datatableData.length * 100)) * 100;
            this.score = this.score.toFixed(2);
        })
        .catch((error)=>{
            this.datatableData = undefined;
            this.datatableError = error;
            console.log(JSON.parse(JSON.stringify(error)))
        })
    }

    handleCloseResult()
    {
        //Navigate to home page
        const pageName = '/';
        this[NavigationMixin.Navigate]({
            type: "standard__webPage",
            attributes: {
                url: pageName
            }
        });
    }

    calculateScore(marks)
    {
        let ma = parseInt(marks);
        this.finalScore += ma;
    }
    
}