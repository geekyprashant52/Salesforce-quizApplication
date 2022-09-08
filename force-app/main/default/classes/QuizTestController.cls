public with sharing class QuizTestController {
    @AuraEnabled(cacheable = true)
    public static List<QuizTest__c> getQuizTestData(){
        try {
            return [SELECT Id, Quiz_Name__c, Total_questions__c, Time_in_minutes__c FROM QuizTest__c];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
