import { LightningElement, track, api } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import saveQuizQuestion from '@salesforce/apex/QuizQuestionController.saveQuizQuestion';

const alphabetArray = ['A', 'B', 'C', 'D', 'E', 'F'];

export default class AdminQuizPage extends LightningElement {


    @api recordId;

    @track question = "";
    @track description = "";
    @track optionCount;
    @track optionType = "";
    @track radioValue = "";
    @track checkboxValue = [];
    dummyArray = [];
    finalOptionsArray = [];
    @track isOptionSingle = false;
    @track isInputError = false;
    @track isAnswerError = false;
    @track isOptionsEditable = true;

    @track errorMessage = "";


    optionInputObj = {"Option_A" : ""};
    get options() {
        return [
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
            { label: '6', value: '6' },
        ];
    }

    get optionsforType() {
        return [
            { label: 'Single', value: 'single' },
            { label: 'Multiple', value: 'multiple' },
        ];
    }

    get showType()
    {
        return this.optionCount > 3 ? true : false;
    }

    get radioOptions()
    {
        return this.finalOptionsArray;
    }

    get checkboxOptions()
    {
        return this.finalOptionsArray;
    }

    handleOptionCountChange(event)
    {
        this.optionType = "";
        this.optionInputObj = {"Option_A" : ""};
        this.optionCount = event.detail.value;
        if(this.dummyArray.length >0){
            this.dummyArray = []
        }
        this.makeDummyArray();
        this.radioValue = "";
        this.checkboxValue = [];
    }

    handleOptionTypeChange(event)
    {
        this.optionType = event.detail.value;
        if(this.optionType == "single")
        {
            this.isOptionSingle = true;
            //create radio-group buttons
        }
        else
        {
            this.isOptionSingle = false;
            //create checkbox
        }
        this.radioValue = "";
        this.checkboxValue = [];
    }

    handleOptionInputChange(event)
    {
        let inputValue = event.target.value;
        let inputName = event.target.name;
        this.dummyArray.forEach(element => {
            if(inputName == element.value)
            {
                this.optionInputObj[element.value] = inputValue;
            }

        });
    }

    handleRadioChange(event)
    {
        this.radioValue = event.detail.value;
        this.checkboxValue = [];
        //console.log(event.detail.value)
    }

    handleCheckboxChange(event)
    {
        this.checkboxValue = event.detail.value;
        this.radioValue = "";
        // console.log(JSON.parse(JSON.stringify(this.checkboxValue)).length)
    }

    handleQuestionChange(event)
    {
        this.question = event.target.value;
    }

    handleDescriptionChange(event)
    {
        this.description = event.target.value;
    }

    makeDummyArray()
    {
        for(let i=0;i<this.optionCount;i++){
            let obj = {"label" : "", "value" : "Option_"+ alphabetArray[i] , "isAnswer" : false};
            this.dummyArray.push(obj);
        }
        //console.log(this.dummyArray)
    }

    

    handleOptionSave()
    {
        
        let comboBox = this.template.querySelector('.inputTypeCombobox');

        if(this.optionType == "")
        {
            //console.log("Option type is empty");
            if(this.showType)
            {
                comboBox.setCustomValidity('Please select option type');
                comboBox.reportValidity();
            }
            else
            {
                this.isOptionSingle = true
                if(Object.keys(this.optionInputObj).length != this.optionCount)
                {
                    //show error
                    try {
                        this.showErrors();
                    } catch (error) {
                        console.log(error)
                    }
                }
                else
                {
                    //save records
                    try {
                        this.saveRecords();
                    } catch (error) {
                        console.log(error)
                    }
                }
            }
            
        }
        else
        {
            //after optiontype is selected
            comboBox.setCustomValidity('');
            comboBox.reportValidity();
            if(Object.keys(this.optionInputObj).length != this.optionCount)
            {
                //console.log("Please enter all options") optionsInput
                try {
                    this.showErrors();
                } catch (error) {
                    console.log(error)
                }
                
            }
            else
            {
                //save records
                try {
                    this.saveRecords();
                } catch (error) {
                    console.log(error)
                }
                
            }
        }
        
    }


    saveRecords()
    {
        this.isInputError = false;
        this.isOptionsEditable = false;
        this.finalOptionsArray = [];

        let optionKeys = Object.keys(this.optionInputObj);
        let optionValues = Object.values(this.optionInputObj);
        for(let i=0; i<optionKeys.length; i++)
        {
            let item = optionKeys[i];
            let value = optionValues[i];
            let obj = {"label" : value, "value" : item , "isAnswer" : false};
            this.finalOptionsArray.push(obj);
        }

        if(this.optionType == "single" || this.isOptionSingle == true)
        {
            this.isOptionSingle = true;
            //create radio-group buttons
        }
        else
        {
            this.isOptionSingle = false;
            //create checkbox
        }
    }

    showErrors()
    {
        this.isInputError = true;

        let inputofOptionsArray = this.template.querySelectorAll('.optionsInput')
        console.log(inputofOptionsArray.length)
        inputofOptionsArray.forEach(element => {
            let value = JSON.parse(JSON.stringify(this.optionInputObj[element.name]));
            if(value.trim() == "")
            {
                this.isInputError = true;
            }
        });
    }

    

    handleOptionEdit()
    {
        this.isOptionsEditable = true;
        this.dummyArray = [];
        this.dummyArray = [...this.finalOptionsArray];
        this.radioValue = "";
        this.checkboxValue = [];
    }

    

    handleQuestionSave()
    {
        let questionInput = this.template.querySelector('.questionInput');
        if(this.question == "")
        {
            //error
            questionInput.setCustomValidity('Please enter question');
            questionInput.reportValidity();
        }
        else if(this.radioValue == "" && this.isOptionSingle)
        {
            //error
            questionInput.setCustomValidity('');
            questionInput.reportValidity();
            this.isAnswerError = true;
            this.errorMessage = "Please select answer";
        }
        else if(JSON.parse(JSON.stringify(this.checkboxValue)).length < 2 && !this.isOptionSingle)
        {
            //error
            questionInput.setCustomValidity('');
            questionInput.reportValidity();
            this.isAnswerError = true;
            this.errorMessage = "Please select at least 2 answers";
        }
        else
        {
            //save call apex
            questionInput.setCustomValidity('');
            questionInput.reportValidity();
            this.isAnswerError = false;
            this.saveDatatoSFDC();
            this.closeQuickAction();
        }
    }


    closeQuickAction() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    saveDatatoSFDC()
    {
        //{"label" : value, "value" : item , "isAnswer" : false};
        // let optionsObject = {};
        // this.finalOptionsArray.forEach(element => {
        //     //let dummyObj = {element.value : element.label}
        // });
        
        saveQuizQuestion({question:this.question, description:this.description, options:this.optionInputObj, 
                    answer: this.isOptionSingle ? this.radioValue : this.checkboxValue.join(';'), 
                type : this.isOptionSingle ? 'Single' : 'Multiple', testId: this.recordId})
        .then((response)=>{
            this.dispatchEvent(new ShowToastEvent({
              title:'Success!',
              message:'Question created successfully',
              variant:'success'
            }))
            if(response)
            {
                this.closeQuickAction();
            }
            //this.closeQuickAction();
        })
        .catch((error)=>{
            this.dispatchEvent(new ShowToastEvent({
              title:'Error!',
              message:'Question not created ' + error,
              variant:'error'
            }))
        })
    }
}