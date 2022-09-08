import { LightningElement, track } from 'lwc';
import getQuizUsersTestDataDirect from '@salesforce/apex/QuizUsersTestController.getQuizUsersTestDataDirect';

export default class MyExamsPage extends LightningElement {

    @track quizUsersTestData;
    quizUsersTestDataError;
    @track isDataLoading = true;

    connectedCallback()
    {
        this.fetchDataFromDB();
    }

    fetchDataFromDB()
    {
        getQuizUsersTestDataDirect()
        .then((response)=>{
            if(response.length > 0)
            {
                this.quizUsersTestData = response;
                this.findUniqueData();
            }
            
            this.isDataLoading = false;
            this.quizUsersTestDataError = undefined;
        })
        .catch((error)=>{
            this.quizUsersTestData = undefined;
            this.quizUsersTestDataError = error;
        })
    }

    findUniqueData()
    {
        if(this.quizUsersTestData)
        {
            const uniqueData = [];
            const filteredResult = this.quizUsersTestData.filter((element)=>{
                const isDuplicate = uniqueData.includes(element.Test_Time__c);

                if (!isDuplicate) {
                    uniqueData.push(element.Test_Time__c);
                    return true;
                }
                return false;
            })
            this.quizUsersTestData = filteredResult;

            //console.log(JSON.parse(JSON.stringify(filteredResult)))
        }
    }
}