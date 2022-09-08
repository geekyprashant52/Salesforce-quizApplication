import { api, LightningElement, track, wire } from 'lwc';


import { NavigationMixin } from 'lightning/navigation';

export default class MyExamsCard extends NavigationMixin(LightningElement) {

    @api myresultcardData;

    handleCardClick()
    {

        let payload = {
            testName : JSON.parse(JSON.stringify(this.myresultcardData.Test_Name__c)),
            testDate : JSON.parse(JSON.stringify(this.myresultcardData.Test_Date__c)),
            testTime : JSON.parse(JSON.stringify(this.myresultcardData.Test_Time__c))
        }
        console.log(payload)

        //here we'll navigate page to my result page
        const pageName = '/result-page' + '?testName=' + payload.testName 
            + '&testDate=' + payload.testDate + '&testTime=' + payload.testTime;
        this[NavigationMixin.Navigate]({
            type: "standard__webPage",
            attributes: {
                url: pageName
            }
        });

        
    }
}