public with sharing class QuizUsersTestController {
    @AuraEnabled
    public static void saveQuizUsersTestData(Map<Id, String> data, 
        String testName, String testDate, String testTime, String timeTaken ){
        try {
            // QuizQuestion__c, Selected_Options__c, Test_Name__c, 
            //Test_Date__c, Test_Time__c FROM quizUserTest__c
            List<quizUserTest__c> quizTestList = new List<quizUserTest__c>();
            for(Id quizquestionId : data.keySet())
            {
                quizUserTest__c quiz = new quizUserTest__c();
                quiz.QuizQuestion__c = quizquestionId;
                quiz.Selected_Options__c = data.get(quizquestionId);
                quiz.Test_Name__c = testName;
                quiz.Test_Date__c = testDate;
                quiz.Test_Time__c = testTime;
                quiz.Time_Taken__c = timeTaken;
                quizTestList.add(quiz);
            }
            insert quizTestList;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<QuizUserTest__c> getQuizUserTestData(String testName, 
        String testDate, String testTime){
        try {
            return [SELECT Id, Selected_Options__c, Test_Name__c, Test_Date__c,
                Test_Time__c, Result__c, QuizQuestion__r.Question__c, 
                QuizQuestion__r.Answer__c, Time_Taken__c,
                QuizQuestion__r.Type__c, Owner.Name, QuizQuestion__r.QuizTestName__r.Time_in_minutes__c
                FROM QuizUserTest__c WHERE Test_Name__c =:testName 
                AND Test_Date__c =:testDate 
                AND Test_Time__c =:testTime];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<QuizUserTest__c> getQuizUsersTestDataDirect(){
        try {
            return [SELECT Id, Test_Name__c, Test_Date__c,
                Test_Time__c
                FROM QuizUserTest__c];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
