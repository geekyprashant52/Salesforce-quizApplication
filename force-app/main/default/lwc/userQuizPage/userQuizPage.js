import { LightningElement, track, wire } from 'lwc';
import getQuizQuestions from '@salesforce/apex/QuizQuestionController.getQuizQuestions';
import LightningConfirm from 'lightning/confirm';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getQuizTestData from '@salesforce/apex/QuizTestController.getQuizTestData';
import saveQuizUsersTestData from '@salesforce/apex/QuizUsersTestController.saveQuizUsersTestData';

import userId from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import UserNameFld from '@salesforce/schema/User.Name';

	
import { NavigationMixin } from 'lightning/navigation';

export default class UserQuizPage extends NavigationMixin(LightningElement) {


    @track showTestsToChoose = true;
    @track quizTestData;
    @track quizTestError;
    @track testNameToPull;
    @track isDataLoading = true;

    @track currentUserName;
    @track currentUserNameError;

    @track quizQuestionsData;
    @track quizQuestionError;
    @track singleQuizQuestion;
    @track isOptionSingle;
    @track nextCount = 0;
    @track maxQuestionCount;
    @track optionsArray = [];
    @track radioValue = "";
    @track checkboxValue = [];
    @track selectedRadioValuesArray = [];
    @track selectedCheckboxValuesArray = [];
    @track dummyRadioValue = "";
    @track isShowOptionsError = false;
    @track showOptionErrorText = "";

    @track timeDownText = "00:00:00";
    intervalArray = [];

    @track uniqueDate;
    @track uniqueTime;
    @track timeTaken;


    @track isDialogVisible = false;
    @track originalMessage;


    @wire(getRecord, { recordId: userId, fields: [UserNameFld]}) 
    userDetails({error, data}) {
        if (data) {
            this.currentUserName = data.fields.Name.value;
            this.isDataLoading = false;
        } else if (error) {
            this.currentUserNameError = error ;
        }
    }




    
    @wire(getQuizTestData)
    quizTestList({error, data})
    {
        if(data)
        {
            if(data.length > 0)
            {
                this.quizTestData = data;
            }
            this.quizTestError = undefined;
        }
        else if(error)
        {
            this.quizTestError = error;
            this.quizTestData = undefined;
            console.log(JSON.parse(JSON.stringify(error)))
        }
    }

    fetchQuizQuestionsData()
    {
        getQuizQuestions({testName: this.testNameToPull})
        .then((data)=>{
            if(data)
            {
                this.isDataLoading = false;
                this.showTestsToChoose = false;
                this.quizQuestionsData = data;
                this.quizQuestionError = undefined;
                this.singleQuizQuestion = this.quizQuestionsData[0];
                this.maxQuestionCount = this.quizQuestionsData.length;
                this.makeOptionsArray();
                this.setOptionSingle();
                this.startCountDown(this.singleQuizQuestion.QuizTestName__r.Time_in_minutes__c)
                //console.log(JSON.parse(JSON.stringify(data)))
            }
        })
        .catch((error)=>{
            if(error)
            {
                this.quizQuestionError = error;
                this.quizQuestionsData = undefined;
                //console.log(JSON.parse(JSON.stringify(error)))
            }
        })
    }

    handleTestNameClick(event)
    {
        //showTestsToChoose = false;
        this.testNameToPull = event.detail;
        this.fetchQuizQuestionsData();
        this.isDataLoading = true;
        this.uniqueDate = new Date().toISOString().slice(0, 10)
        let d = new Date(); // for now
        this.uniqueTime = d.getHours() + "-" + d.getMinutes();
        
        console.log(this.uniqueDate, this.uniqueTime)
        
    }

    startCountDown(time){
        var sec = 60 * time;
        let parentThis = this;
        let timer = setInterval(function()
            {
                const hrs = Math.floor(sec / 3600) % 24;
                const min = Math.floor(sec / 60) % 60;
                const s = Math.floor(sec) % 60
                let hoursText = "00";
                let minutesText = "00";
                let secondsText = "00";

                parentThis.timeTaken = parseInt(time - min);
                if((hrs + "").length < 2)
                {
                    hoursText = "0" + hrs;
                }
                else{
                    hoursText = hrs;
                }
                if((min + "").length < 2)
                {
                    minutesText = "0" + min
                }
                else{
                    minutesText = min
                }
                if((s + "").length < 2)
                {
                    secondsText = "0" + s;
                }
                else{
                    secondsText = s;
                }
                parentThis.timeDownText = hoursText + ":" + minutesText + ":" + secondsText;
            
                //console.log(hrs + " : " + min + " : " + s )
                sec--;
                if (sec < 0) {
                    clearInterval(timer);
                }
            }, 1000);
            parentThis.intervalArray.push(timer)
            if(time<0)
            {
                parentThis.intervalArray.forEach(element => {
                    clearInterval(element)
                });
            }   
    }

    handleNextQuestion()
    {
        if(this.quizQuestionsData)
        {
            if(this.nextCount < this.maxQuestionCount)
            {
                if(this.singleQuizQuestion.Type__c == "Single")
                {
                    if(this.selectedRadioValuesArray.length == 0)
                    {
                        //show error for radio values
                        this.displayOptionsError(true , "Please select answer.")
                    }
                    else
                    {
                        for(let i=0; i<this.selectedRadioValuesArray.length; i++)
                        {
                            if(this.singleQuizQuestion.Id == this.selectedRadioValuesArray[i].id && 
                                this.singleQuizQuestion.Type__c == "Single")
                            {
                                // do operation
                                this.nextCount += 1;
                                this.singleQuizQuestion = this.quizQuestionsData[this.nextCount];
                                this.makeOptionsArray();
                                this.setOptionSingle();
                                this.assignRadioValues();
                                this.assignCheckboxValues();
                                this.displayOptionsError(false , "")
                                break;
                            }
                            else
                            {
                                //show error for radio
                                this.displayOptionsError(true , "Please select answer.")
                            }
                        }
                    }
                }
                else if(this.singleQuizQuestion.Type__c == "Multiple")
                {
                    if(this.selectedCheckboxValuesArray.length == 0)
                    {
                        //show error for checkbox
                        this.displayOptionsError(true , "Please select at least 2 answers.")
                    }
                    else
                    {
                        for(let i=0; i<this.selectedCheckboxValuesArray.length; i++)
                        {
                            if(this.singleQuizQuestion.Id == this.selectedCheckboxValuesArray[i].id &&
                                this.selectedCheckboxValuesArray[i].selected.length >= 2)
                            {
                                this.nextCount += 1;
                                this.singleQuizQuestion = this.quizQuestionsData[this.nextCount];
                                this.makeOptionsArray();
                                this.setOptionSingle();
                                this.assignCheckboxValues();
                                this.assignRadioValues();
                                this.displayOptionsError(false , "")
                                break;
                            }
                            else
                            {
                                //show error
                                this.displayOptionsError(true , "Please select at least 2 answers.")
                            }
                        }
                    }
                }
            }
            else
            {
                //disable next button
            }
        }
    }

    handleBackQuestion()
    {
        if(this.quizQuestionsData)
        {
            if(this.nextCount > 0)
            {
                if(this.singleQuizQuestion.Type__c == "Single")
                {
                    this.assignRadioValues();


                    if(this.selectedRadioValuesArray.length == 0)
                    {
                        //show error for radio values
                        this.displayOptionsError(true , "Please select answer.")
                    }
                    else
                    {
                        for(let i=0; i<this.selectedRadioValuesArray.length; i++)
                        {
                            if(this.singleQuizQuestion.Id == this.selectedRadioValuesArray[i].id && 
                                this.singleQuizQuestion.Type__c == "Single")
                            {
                                // do operation
                                this.nextCount -= 1;
                                this.singleQuizQuestion = this.quizQuestionsData[this.nextCount];
                                this.makeOptionsArray();
                                this.setOptionSingle();
                                this.assignRadioValues();
                                this.assignCheckboxValues();
                                this.displayOptionsError(false , "")
                                break;
                            }
                            else
                            {
                                //show error for radio
                                this.displayOptionsError(true , "Please select answer.")
                            }
                        }
                    }
                }
                else if(this.singleQuizQuestion.Type__c == "Multiple")
                {
                    //this.assignCheckboxValues();


                    if(this.selectedCheckboxValuesArray.length == 0)
                    {
                        //show error for checkbox
                        this.displayOptionsError(true , "Please select at least 2 answers.")
                    }
                    else
                    {
                        for(let i=0; i<this.selectedCheckboxValuesArray.length; i++)
                        {
                            if(this.singleQuizQuestion.Id == this.selectedCheckboxValuesArray[i].id &&
                                this.selectedCheckboxValuesArray[i].selected.length >= 2)
                            {
                                this.nextCount -= 1;
                                this.singleQuizQuestion = this.quizQuestionsData[this.nextCount];
                                this.makeOptionsArray();
                                this.setOptionSingle();
                                this.assignCheckboxValues();
                                this.assignRadioValues();
                                this.displayOptionsError(false , "")
                                break;
                            }
                            else
                            {
                                //show error
                                this.displayOptionsError(true , "Please select at least 2 answers.")
                            }
                        }
                    }


                }

            }
            else
            {
                //disable back button
            }
        }
    }

    // handleSubmitExam()
    // {
    //     this.handleConfirmClick();
    // }

    handleRadioChange(event)
    {
        let isduplicate = false;
        let id = this.singleQuizQuestion.Id;
        let obj = {"id" : id, "selected" : event.detail.value};
        if(this.selectedRadioValuesArray.length == 0)
        {
            this.selectedRadioValuesArray.push(obj)
        }
        else
        {

            for(let i=0; i<this.selectedRadioValuesArray.length; i++)
            {
                let item = this.selectedRadioValuesArray[i];
                if(item.id == id)
                {
                    item["selected"] = event.detail.value;
                    isduplicate = true;
                    console.log("Duplicate entry")
                    break;
                }
                else
                {
                    isduplicate = false;
                }
            }
            
            if(!isduplicate)
            {
                this.selectedRadioValuesArray.push(obj)
                isduplicate = true;
            }
            
        }

        console.log(JSON.parse(JSON.stringify(this.selectedRadioValuesArray)))
        this.assignRadioValues();
    }

    handleCheckboxChange(event)
    {
        //this.checkboxValue = event.detail.value;
        let isduplicate = false;
        let id = this.singleQuizQuestion.Id;
        let obj = {"id" : id, "selected" : event.detail.value};
        if(this.selectedCheckboxValuesArray.length == 0)
        {
            this.selectedCheckboxValuesArray.push(obj)
        }
        else
        {
            for(let i=0; i<this.selectedCheckboxValuesArray.length; i++)
            {
                let item = this.selectedCheckboxValuesArray[i];
                if(item.id == id)
                {
                    item["selected"] = event.detail.value;
                    isduplicate = true;
                    //console.log("Duplicate entry")
                    break;
                }
                else
                {
                    isduplicate = false;
                }
            }
            
            if(!isduplicate)
            {
                this.selectedCheckboxValuesArray.push(obj)
                isduplicate = true;
            }
            
        }

        console.log(JSON.parse(JSON.stringify(this.selectedCheckboxValuesArray)))
        this.assignCheckboxValues();
    }


    get disbleNextButton()
    {
        return this.nextCount+1 == this.maxQuestionCount ? true : false;
    }

    get disbleBackButton()
    {
        return this.nextCount == 0 ? true : false;
    }

    get questionNumber()
    {
        if((this.nextCount +"").length < 2)
        {
            let newCount = this.nextCount + 1;
            return "0" + newCount
        }

        return this.nextCount+1;
    }

    get maxQuestionNumber()
    {
        if((this.maxQuestionCount +"").length < 2)
        {
            return "0" + this.maxQuestionCount
        }
        return this.maxQuestionCount;
    }

    makeOptionsArray()
    {
        this.optionsArray = [];
        if(this.singleQuizQuestion.Option_A__c)
        {
            this.optionsArray.push({"value" : "Option_A", "label" : this.singleQuizQuestion.Option_A__c})
        }
        if(this.singleQuizQuestion.Option_B__c)
        {
            this.optionsArray.push({"value" : "Option_B", "label" : this.singleQuizQuestion.Option_B__c})
        }
        if(this.singleQuizQuestion.Option_C__c)
        {
            this.optionsArray.push({"value" : "Option_C", "label" : this.singleQuizQuestion.Option_C__c})
        }
        if(this.singleQuizQuestion.Option_D__c)
        {
            this.optionsArray.push({"value" : "Option_D", "label" : this.singleQuizQuestion.Option_D__c})
        }
        if(this.singleQuizQuestion.Option_E__c)
        {
            this.optionsArray.push({"value" : "Option_E", "label" : this.singleQuizQuestion.Option_E__c})
        }
        if(this.singleQuizQuestion.Option_F__c)
        {
            this.optionsArray.push({"value" : "Option_F", "label" : this.singleQuizQuestion.Option_F__c})
        }
    }

    setOptionSingle()
    {
        //console.log(JSON.parse(JSON.stringify(this.singleQuizQuestion.Type__c)))
        if(this.singleQuizQuestion.Type__c == "Single")
        {
            this.isOptionSingle = true;
        }
        else if(this.singleQuizQuestion.Type__c == "Multiple")
        {
            this.isOptionSingle = false;
        }
    }


    handleSubmitExam() {
        if(this.selectedCheckboxValuesArray.length + 
            this.selectedRadioValuesArray.length == this.quizQuestionsData.length)
            {
                this.isDialogVisible = true;
                // const result = await LightningConfirm.open({
                //     message: 'Are you sure?',
                //     label: 'You want to submit exam',
                //     theme: 'warning'
                // });

                // if(result)
                // {
                // this.isShowOptionsError = false;
                // this.showOptionErrorText = "";
                // this.submitQuestionsToDb();
                //}    
            }
            else
            {
                //show error 
                this.isShowOptionsError = true;
                this.showOptionErrorText = "Please select all questions"
                //alert("Please select all questions")
            }
    }

    resetEveryThing()
    {
        this.showTestsToChoose = true;
        this.quizQuestionsData = undefined;
        this.quizQuestionError = undefined;
        this.singleQuizQuestion = undefined;;
        this.isOptionSingle = undefined;;
        this.nextCount = 0;
        this.maxQuestionCount = undefined;;
        this.optionsArray = [];
        this.radioValue = "";
        this.checkboxValue = [];
        this.selectedRadioValuesArray = [];
        this.selectedCheckboxValuesArray = [];
        this.dummyRadioValue = "";
        this.isShowOptionsError = false;
        this.showOptionErrorText = "";
        this.timeDownText = "00:00:00";
        this.startCountDown(-1);
    }

    

    assignRadioValues()
    {
        if(this.selectedRadioValuesArray.length > 0)
        {
            for(let i=0; i<this.selectedRadioValuesArray.length; i++)
            {
                let item = this.selectedRadioValuesArray[i];
                if(item.id == this.singleQuizQuestion.Id)
                {
                    this.radioValue = item.selected;
                    //console.log("Radio id Matched")
                    break;
                }
                else
                {
                    //console.log("Radio id not Matched")
                    this.radioValue = "";    
                }
            }      
        }
    }

    assignCheckboxValues()
    {
        if(this.selectedCheckboxValuesArray.length > 0)
        {
            for(let i=0; i<this.selectedCheckboxValuesArray.length; i++)
            {
                let item = this.selectedCheckboxValuesArray[i];
                if(item.id == this.singleQuizQuestion.Id)
                {
                    this.checkboxValue = item.selected;
                    break;
                }
                else
                {
                    this.checkboxValue = [];  
                }
            }    
        }
    }

    displayOptionsError(isError, error)
    {
        this.isShowOptionsError = isError;
        this.showOptionErrorText = error;
    }


    submitQuestionsToDb()
    {
        let combinedArray = [];
        this.selectedCheckboxValuesArray.map((item)=>{
            let obj = {"questionId" : item.id, "selected" : item.selected.join(';')}
            combinedArray.push(obj);
        })

        this.selectedRadioValuesArray.map((item)=>{
            let obj = {"questionId" : item.id , "selected" : item.selected}
            combinedArray.push(obj);
        })
        let objToSaveinDb = {[combinedArray[0].questionId] : combinedArray[0].selected};
        for(let i=1; i<combinedArray.length; i++)
        {
            let item = combinedArray[i];
            objToSaveinDb[item.questionId] = item.selected;
        }

        saveQuizUsersTestData({data : objToSaveinDb, testDate : this.uniqueDate,
                testName : this.testNameToPull, testTime: this.uniqueTime, timeTaken: this.timeTaken})
        .then((response)=>{

            console.log("Data saved")
            this.resetEveryThing();
            this.handleGotoPage();
            this.dispatchEvent(new ShowToastEvent({
                title:'Success!',
                message:'Test Saved successfully',
                variant:'success'
            }))

            // if(response)
            // {
                
            // }
        })
        .catch((error)=>{
            if(error)
            {
                this.dispatchEvent(new ShowToastEvent({
                    title:'Error!',
                    message:'Test not saved',
                    variant:'error'
                }))
            }
        })
    }

    handleGotoPage()
    {
        //Navigate to result page
        const pageName = '/result-page' + '?testName=' + this.testNameToPull 
            + '&testDate=' + this.uniqueDate + '&testTime=' + this.uniqueTime;

        this[NavigationMixin.Navigate]({
            type: "standard__webPage",
            attributes: {
                url: pageName
            }
        });
    }

    handleConfirmDialogueBox(event)
    {
        if(event.detail !== 1){
            if(event.detail.status === 'confirm') {
                this.isShowOptionsError = false;
                this.showOptionErrorText = "";
                this.submitQuestionsToDb();
                this.isDialogVisible = false;
            }
            else if(event.detail.status === 'cancel'){
                this.isDialogVisible = false;
            }
        }
        
    }

}