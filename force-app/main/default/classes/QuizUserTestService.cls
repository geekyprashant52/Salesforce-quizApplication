public with sharing class QuizUserTestService {
    public static void setQuizResult(List<QuizUserTest__c> quizList)
    {
        Map<Id, String> questionsList = new Map<Id, String>();
        List<Id> questionIdList = new List<Id>();
        for(QuizUserTest__c quiz : quizList)
        {
            questionIdList.add(quiz.QuizQuestion__c);
        }

        for(QuizQuestion__c question : [SELECT Id, Answer__c FROM QuizQuestion__c WHERE Id IN :questionIdList])
        {
            questionsList.put(question.Id, question.Answer__c);
        }

        for(QuizUserTest__c quiz : quizList)
        {
            if(questionsList.containsKey(quiz.QuizQuestion__c))
            {
                if(questionsList.get(quiz.QuizQuestion__c) == quiz.Selected_Options__c)
                {
                    quiz.Result__c = '100';
                }
                else {
                    quiz.Result__c = '0';
                }
            }
        }
    }
}
