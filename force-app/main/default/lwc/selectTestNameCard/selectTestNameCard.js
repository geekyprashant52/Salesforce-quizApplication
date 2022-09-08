import { api, LightningElement, track, wire } from 'lwc';

export default class SelectTestNameCard extends LightningElement {

    @api quizTestData;

    handleCardClick()
    {
        let testName = JSON.parse(JSON.stringify(this.quizTestData)).Quiz_Name__c;
        let testNameEvnt = new CustomEvent("handlecardclick", {
            detail: testName
        });

        // Dispatches the event.
        this.dispatchEvent(testNameEvnt);
    }
    

}