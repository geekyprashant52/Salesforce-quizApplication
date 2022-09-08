public with sharing class QuizQuestionController {
    @AuraEnabled
    public static void saveQuizQuestion(String question, String description, Map<String, String> options, 
        String answer, String type, Id testId){
        try {
            //SELECT Id, Question__c, Option_A__c, Option_B__c, Option_C__c, 
            //Option_D__c, Answer__c, Type__c, QuizTestName__c FROM QuizQuestion__c
            QuizQuestion__c quizQuestionObj = new QuizQuestion__c();
            quizQuestionObj.Question__c = question;
            quizQuestionObj.Description__c = description;
            for(String optionName : options.keySet())
            {
                switch on optionName {
                    when 'Option_A' {
                        quizQuestionObj.Option_A__c = options.get(optionName);
                    }
                    when 'Option_B' {
                        quizQuestionObj.Option_B__c = options.get(optionName);
                    }
                    when 'Option_C' {
                        quizQuestionObj.Option_C__c = options.get(optionName);
                    }
                    when 'Option_D' {
                        quizQuestionObj.Option_D__c = options.get(optionName);
                    }
                    when 'Option_E' {
                        quizQuestionObj.Option_E__c = options.get(optionName);
                    }
                    when 'Option_F' {
                        quizQuestionObj.Option_F__c = options.get(optionName);
                    }
                    when else {
                        //
                    }
                }
            }
            quizQuestionObj.Answer__c = answer;
            quizQuestionObj.Type__c = type;
            quizQuestionObj.QuizTestName__c = testId;

            insert quizQuestionObj;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<QuizQuestion__c> getQuizQuestions(String testName){
        try {
            return [SELECT Id, Question__c, Option_A__c, Option_B__c, Option_C__c, 
                        Option_D__c, Option_E__c, Option_F__c, Answer__c, Type__c, Description__c, QuizTestName__r.Quiz_Name__c ,
                            QuizTestName__r.Time_in_minutes__c
                            FROM QuizQuestion__c WHERE QuizTestName__r.Quiz_Name__c =:testName];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
